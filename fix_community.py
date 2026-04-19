"""
Fix CommunityPage.tsx: Remove orphaned old post card code (lines 957-1175, 0-indexed: 957..1175)
Run this from the project root: python fix_community.py
"""
import os

filepath = os.path.join('src', 'views', 'CommunityPage.tsx')

with open(filepath, 'r', encoding='utf-8-sig') as f:
    content = f.read()

# Split on the unique marker: the start of orphaned block
# The orphaned block starts right after the new map's })}
# and begins with whitespace + '<div className="text-right">'
# We know the new code's last })} is at line 957 (1-indexed)
# The old block ends with the feed column </div> just before the sidebar comment

lines = content.splitlines(keepends=True)
total = len(lines)
print(f"Total lines: {total}")

# Lines are 1-indexed: keep lines 1..957 and 1177..end (0-indexed: 0..956 and 1176..end)
kept = lines[:957] + lines[1176:]

print(f"Lines after fix: {len(kept)}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(kept)

print("Done! CommunityPage.tsx fixed successfully.")
