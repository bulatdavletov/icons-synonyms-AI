#!/usr/bin/env python3
import os
import re
import sys
from bs4 import BeautifulSoup
import html2text

def convert_mhtml_to_md(mhtml_file_path):
    """Convert an MHTML file to Markdown format with better text content extraction."""
    # Read the MHTML file
    with open(mhtml_file_path, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
    
    # Extract title from the filename for fallback
    file_title = os.path.splitext(os.path.basename(mhtml_file_path))[0]
    
    # Find the main HTML content
    html_parts = re.findall(r'Content-Type: text/html.*?(?=------MultipartBoundary|\Z)', content, re.DOTALL)
    if not html_parts:
        print(f"Could not extract HTML content from {mhtml_file_path}")
        return None
    
    # Use the largest HTML part
    html_content = max(html_parts, key=len)
    
    # Extract the body content if possible
    body_match = re.search(r'<body[^>]*>(.*?)</body>', html_content, re.DOTALL | re.IGNORECASE)
    if body_match:
        body_content = body_match.group(1)
    else:
        body_content = html_content
    
    # Parse the HTML content
    soup = BeautifulSoup(body_content, 'html.parser')
    
    # Remove non-content elements
    for tag in ['script', 'style', 'meta', 'link', 'noscript', 'svg', 'header', 'footer', 'nav']:
        for element in soup.find_all(tag):
            element.decompose()
    
    # Try to find main content section
    main_content = None
    for selector in ['main', 'article', '.main-content', '#content', '.article', '#main']:
        found = soup.select(selector)
        if found:
            main_content = found[0]
            break
    
    # If we found a main content section, use it; otherwise use the entire body
    if main_content:
        content_html = str(main_content)
    else:
        content_html = str(soup)
    
    # Convert HTML to Markdown
    converter = html2text.HTML2Text()
    converter.ignore_links = False
    converter.body_width = 0  # No wrapping
    converter.unicode_snob = True
    converter.images_to_alt = True
    converter.default_image_alt = ""
    converter.protect_links = True
    
    markdown = converter.handle(content_html)
    
    # Clean up the markdown
    # Remove MIME encoding artifacts
    markdown = re.sub(r'3D"([^"]*)"', r'"\1"', markdown)
    
    # Remove HTML entities
    markdown = re.sub(r'&[a-zA-Z0-9#]+;', ' ', markdown)
    
    # Clean up URLs
    markdown = re.sub(r'\(https?://[^)]*\)', lambda m: m.group(0).replace(' ', ''), markdown)
    
    # Remove excessive newlines
    markdown = re.sub(r'\n{3,}', '\n\n', markdown)
    
    # Process the markdown line by line
    lines = markdown.split('\n')
    cleaned_lines = []
    
    # Look for a title in h1/h2 headers
    title = file_title
    title_found = False
    
    for line in lines:
        # Skip empty lines
        if not line.strip():
            continue
            
        # Look for title in headers
        if not title_found and (line.startswith('# ') or line.startswith('## ')):
            possible_title = line.lstrip('#').strip()
            if len(possible_title) > 3 and len(possible_title) < 100:
                title = possible_title
                title_found = True
                continue
        
        # Skip navigation menus, headers that are just single words
        if line.startswith('#') and len(line.strip('#').strip()) < 4:
            continue
            
        # Skip CSS artifacts
        if 'px' in line or 'background-color' in line or 'mask-image' in line:
            continue
            
        # Skip lines that are just special characters
        if re.match(r'^[\W_]+$', line.strip()):
            continue
            
        # Clean up equal signs
        line = re.sub(r'=\s+', ' ', line)
        line = re.sub(r'\s+=', ' ', line)
        
        # Keep this line
        cleaned_lines.append(line)
    
    # Combine the lines back into text
    markdown_content = '\n'.join(cleaned_lines)
    
    # Final cleaning steps
    # Remove references to ids, classes, and other HTML attributes
    markdown_content = re.sub(r'id="[^"]*"', '', markdown_content)
    markdown_content = re.sub(r'class="[^"]*"', '', markdown_content)
    markdown_content = re.sub(r'style="[^"]*"', '', markdown_content)
    
    # Clean up broken Markdown links
    markdown_content = re.sub(r'\[([^\]]+)\]\s*\([^)]*\)', r'\1', markdown_content)
    
    # Remove HTML tags
    markdown_content = re.sub(r'<\s*/?\s*[a-zA-Z][^>]*>', '', markdown_content)
    
    # Fix spacing issues caused by HTML removal
    markdown_content = re.sub(r'(\w)\s+(\w)', r'\1 \2', markdown_content)
    
    # Remove any multi-spaces and replace with a single space
    markdown_content = re.sub(r' {2,}', ' ', markdown_content)
    
    # Start with the title
    final_content = f"# {title}\n\n{markdown_content.strip()}"
    
    return final_content

def main():
    if len(sys.argv) < 2:
        print("Usage: python final_mhtml_to_md.py <directory_with_mhtml_files>")
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