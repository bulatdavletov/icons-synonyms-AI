#!/usr/bin/env python3
import os
import re
import sys
from bs4 import BeautifulSoup
import html2text

def convert_mhtml_to_md(mhtml_file_path):
    """Convert an MHTML file to Markdown format."""
    # Read the MHTML file
    with open(mhtml_file_path, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
    
    # Find the Content-Type: text/html section
    html_parts = re.findall(r'Content-Type: text/html.*?(?=------MultipartBoundary|\Z)', content, re.DOTALL)
    
    if not html_parts:
        print(f"Could not extract HTML content from {mhtml_file_path}")
        return None
    
    # Use the largest HTML part (likely the main content)
    html_content = max(html_parts, key=len)
    
    # Extract only the body content
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL | re.IGNORECASE)
    if body_match:
        body_content = body_match.group(1)
    else:
        body_content = html_content
    
    # Parse the HTML
    soup = BeautifulSoup(body_content, 'html.parser')
    
    # Remove scripts, styles, and other non-content elements
    for element in soup(['script', 'style', 'meta', 'link', 'noscript', 'header', 'footer', 'nav', 'svg']):
        element.decompose()
    
    # Remove all class, style, and ID attributes to clean up the HTML
    for tag in soup.find_all(True):
        if tag.has_attr('class'):
            del tag['class']
        if tag.has_attr('style'):
            del tag['style']
        if tag.has_attr('id'):
            del tag['id']
        if tag.has_attr('aria-label'):
            del tag['aria-label']
        if tag.has_attr('data-grz-qa'):
            del tag['data-grz-qa']
    
    # Get the main content area if available
    main_content = soup.find('main')
    if main_content:
        # Use only the main content
        clean_html = str(main_content)
    else:
        # Try to find article or section tags
        article = soup.find('article')
        if article:
            clean_html = str(article)
        else:
            # Try to find the first big div that might contain the content
            divs = soup.find_all('div')
            if divs and len(divs) > 3:  # Assuming at least a few divs for structure
                # Use one of the larger divs (potentially the content)
                largest_divs = sorted(divs, key=lambda x: len(str(x)), reverse=True)
                if len(largest_divs) > 0:
                    clean_html = str(largest_divs[0])
                else:
                    clean_html = str(soup)
            else:
                clean_html = str(soup)
    
    # Remove any leftover HTML comments
    clean_html = re.sub(r'<!--.*?-->', '', clean_html, flags=re.DOTALL)
    
    # Initialize html2text
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.body_width = 0  # No wrapping
    h.unicode_snob = True
    h.skip_internal_links = True
    h.ignore_images = False
    h.mark_code = True
    
    # Convert to Markdown
    markdown_content = h.handle(clean_html)
    
    # Clean up the markdown content
    # Remove reference to 3D
    markdown_content = re.sub(r'3D"([^"]*)"', r'"\1"', markdown_content)
    
    # Remove HTML entities
    markdown_content = re.sub(r'&[a-zA-Z0-9#]+;', ' ', markdown_content)
    
    # Remove remaining HTML tags
    markdown_content = re.sub(r'<[^>]*>', '', markdown_content)
    
    # Remove references to CSS classes and styles
    markdown_content = re.sub(r'class=.*', '', markdown_content)
    markdown_content = re.sub(r'style=.*', '', markdown_content)
    
    # Remove excessive newlines
    markdown_content = re.sub(r'\n{3,}', '\n\n', markdown_content)
    
    # Clean up equal signs that appear at the end of lines or beginning
    markdown_content = re.sub(r'=\s*\n', '\n', markdown_content)
    markdown_content = re.sub(r'\n\s*=', '\n', markdown_content)
    
    # Clean up standalone equal signs
    markdown_content = re.sub(r'(?<!\w)=(?!\w)', '', markdown_content)
    
    # Fix spacing issues in words with spaces in the middle
    markdown_content = re.sub(r'(\w+)\s+(\w+)', lambda m: f"{m.group(1)} {m.group(2)}" 
                             if len(m.group(1)) > 2 and len(m.group(2)) > 2 
                             else f"{m.group(1)}{m.group(2)}", markdown_content)
    
    # Remove lines containing only special characters or very short content
    lines = markdown_content.split('\n')
    filtered_lines = []
    for line in lines:
        # Skip empty lines or lines with just special characters
        line = line.strip()
        if line and not re.match(r'^[=\-_\s]+$', line):
            # Skip very short lines that appear to be CSS fragments
            if len(line) > 2 and not re.match(r'^[#<>]?\s*\d+px', line):
                # Clean up equal signs within lines
                line = re.sub(r'(?<=\w)=\s+', ' ', line)
                line = re.sub(r'\s+=(?=\w)', ' ', line)
                
                # Fix common artifacts from mhtml conversion
                line = line.replace('= ', '')
                line = line.replace(' =', '')
                
                # Fix spaces in words (caused by HTML wrapping)
                line = re.sub(r'(\w+)\s+(\w+)', lambda m: f"{m.group(1)}{m.group(2)}" 
                             if (len(m.group(1)) <= 2 or len(m.group(2)) <= 2) 
                             else f"{m.group(1)} {m.group(2)}", line)
                
                filtered_lines.append(line)
    
    markdown_content = '\n'.join(filtered_lines)
    
    # Fix spaces in URLs
    markdown_content = re.sub(r'https?://\s+', lambda m: m.group(0).replace(' ', ''), markdown_content)
    markdown_content = re.sub(r'(\w)\s+\.(\w)', r'\1.\2', markdown_content)
    
    # Clean up any leftover lines with just fragments
    markdown_content = re.sub(r'\n[\da-f]{1,6}\n', '\n', markdown_content)
    
    # Try to find the article title from the content
    title_match = re.search(r'# (.*?)(\n|$)', markdown_content)
    if title_match:
        article_title = title_match.group(1).strip()
        # Remove the extracted title from the content
        markdown_content = re.sub(r'# .*?(\n|$)', '', markdown_content, count=1)
    else:
        # Extract title from the original filename
        article_title = os.path.splitext(os.path.basename(mhtml_file_path))[0]
    
    # Add the title to the markdown content
    markdown_content = f"# {article_title}\n\n{markdown_content.strip()}"
    
    # Additional cleanup of URLs
    markdown_content = re.sub(r'\(3D"https?://[^"]*"\)', r'', markdown_content)
    markdown_content = re.sub(r'\("https?://[^"]*"\)', r'', markdown_content)
    
    # Final pass to fix word spacing issues
    lines = markdown_content.split('\n')
    fixed_lines = []
    for line in lines:
        # Fix spacing in words that got broken during HTML rendering
        # This handles cases where spaces were inserted in the middle of words
        words = line.split()
        if len(words) > 1:
            i = 0
            while i < len(words) - 1:
                # If current word ends with a letter and next word starts with lowercase letter
                # and neither is a common word, they might be part of the same word
                if (words[i] and words[i+1] and
                    re.match(r'.*[a-zA-Z]$', words[i]) and 
                    re.match(r'^[a-z]', words[i+1]) and
                    len(words[i]) > 1 and len(words[i+1]) > 1):
                    
                    common_words = ['the', 'and', 'or', 'but', 'for', 'nor', 'yet', 'so', 'a', 'an', 
                                   'in', 'on', 'at', 'by', 'to', 'of', 'with', 'from', 'about', 'as']
                    
                    if (words[i].lower() not in common_words and 
                        words[i+1].lower() not in common_words):
                        words[i] = words[i] + words[i+1]
                        words.pop(i+1)
                        continue
                i += 1
        
        fixed_line = ' '.join(words)
        fixed_lines.append(fixed_line)
    
    markdown_content = '\n'.join(fixed_lines)
    
    return markdown_content

def main():
    if len(sys.argv) < 2:
        print("Usage: python convert_mhtml_to_md.py <directory_with_mhtml_files>")
        sys.exit(1)
    
    directory = sys.argv[1]
    
    if not os.path.isdir(directory):
        print(f"Error: {directory} is not a valid directory")
        sys.exit(1)
    
    # Process all .mhtml files in the directory
    for filename in os.listdir(directory):
        if filename.endswith('.mhtml'):
            mhtml_path = os.path.join(directory, filename)
            print(f"Converting {filename}...")
            
            markdown_content = convert_mhtml_to_md(mhtml_path)
            
            if markdown_content:
                # Save to a new .md file
                md_path = os.path.join(directory, f"{os.path.splitext(filename)[0]}.md")
                with open(md_path, 'w', encoding='utf-8') as md_file:
                    md_file.write(markdown_content)
                
                print(f"  Created {os.path.basename(md_path)}")
            else:
                print(f"  Failed to convert {filename}")
    
    print("Conversion complete!")

if __name__ == "__main__":
    main() 