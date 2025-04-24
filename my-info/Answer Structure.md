Groups:

Usage (required)
This is how icon is used in the IDE.
Usually it's name of the action or feature.
Output: name splitted with spaces, if it contain more that 1 word in camel case.
Name of icon: general/projectStructure
Output: project structure

Object (required)
If name is projectStructure, but there is folder icon, it should be "folder", and synonyms, if applicable.
Output: folder, directory

Modificator (if found. Empty if not)
We use modificators, so I want to see name of icon, and name of modificator separately.
Name of icon - is "Name of object".
Modificators are usually on the right bottom, small ones.
Input: icon of folder with small gear icon on the right bottom
Output: gear, settings

Shapes (empty, if no simple specific shapes)
If the icon looks like it contains more than 1 object, describe them all. 
Small shapes, objects, everything that you see on the icon.
If there are synonyms, describe them all.
Output: circle, square, rectangle, arrow, play, triangle, etc.

Example 1:
Input: icon of folder with small gear icon on the right bottom
Output:
Usage: project structure
Object: folder
Modificator: gear

Example 2:
Input: icon of target.
Output:
Usage: run
Object: target
Shapes: circle, arrow.

