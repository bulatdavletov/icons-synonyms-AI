#!/bin/sh
# Script to convert MHTML files to Markdown
python3 "$(dirname "$0")/final_mhtml_to_md.py" "$@"
