import os
import re

files = [
    'src/app/(dashboard)/dashboard/activities/page.tsx',
    'src/app/(dashboard)/dashboard/catechism/[id]/page.tsx',
    'src/app/(dashboard)/dashboard/catechism/new/page.tsx',
    'src/app/(dashboard)/dashboard/catechism/page.tsx',
    'src/app/(dashboard)/dashboard/households/[id]/add-member/page.tsx',
    'src/app/(dashboard)/dashboard/households/[id]/page.tsx',
    'src/app/(dashboard)/dashboard/households/[id]/split/page.tsx',
    'src/app/(dashboard)/dashboard/households/add/page.tsx',
    'src/app/(dashboard)/dashboard/households/page.tsx',
    'src/app/(dashboard)/dashboard/page.tsx',
    'src/app/(dashboard)/dashboard/parishioners/[id]/edit/page.tsx',
    'src/app/(dashboard)/dashboard/parishioners/[id]/page.tsx',
    'src/app/(dashboard)/dashboard/parishioners/create/page.tsx',
    'src/app/(dashboard)/dashboard/parishioners/page.tsx',
    'src/app/(dashboard)/dashboard/sacraments/[id]/page.tsx',
    'src/app/(dashboard)/dashboard/sacraments/batch/page.tsx',
    'src/app/(dashboard)/dashboard/sacraments/marriages/[id]/page.tsx',
    'src/app/(dashboard)/dashboard/sacraments/new/page.tsx',
    'src/app/(dashboard)/dashboard/sacraments/page.tsx',
    'src/app/(dashboard)/dashboard/zones/[id]/edit/page.tsx',
    'src/app/(dashboard)/dashboard/zones/[id]/page.tsx',
    'src/app/(dashboard)/dashboard/zones/create/page.tsx',
    'src/app/(dashboard)/dashboard/zones/page.tsx',
    'src/app/(dashboard)/settings/accounts/page.tsx',
    'src/app/(dashboard)/settings/page.tsx',
    'src/app/(dashboard)/settings/parish/page.tsx',
    'src/app/(dashboard)/settings/saints/page.tsx',
    'src/app/(public)/page.tsx',
    'src/app/forgot-password/page.tsx',
    'src/app/layout.tsx',
    'src/app/login/page.tsx',
    'src/app/not-found.tsx',
    'src/app/reset-password/page.tsx',
    'src/app/super-admin/dashboard/churches/page.tsx',
    'src/app/super-admin/dashboard/page.tsx',
    'src/app/super-admin/login/page.tsx'
]

pattern = re.compile(r"export\s+const\s+runtime\s*=\s*['\"]edge['\"];?\s*\n?", re.MULTILINE)
changed = 0

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content, count = pattern.subn('', content)
        if count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            changed += 1

print(f"Removed edge runtime from {changed} files")
