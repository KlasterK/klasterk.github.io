import argparse
import pathlib
import re
import functools
import configparser

def scan_templates(
    dir: pathlib.Path,
    root: pathlib.Path
) -> list[tuple[str, pathlib.Path]]:
    templates = []

    for file in dir.iterdir():
        if file.is_dir():
            templates += scan_templates(file, root)
        else:
            templates.append((file.relative_to(root).as_posix(), file))
            
    return templates

def scan_content(
    dir: pathlib.Path,
    root: pathlib.Path
) -> list[tuple[str, pathlib.Path, pathlib.Path]]:
    content = []

    for file in dir.iterdir():
        if file.is_dir():
            content += scan_content(file, root)
        else:
            content.append((file.relative_to(root), file))
    return content

def replace_substitutions(
    templates: list[tuple[str, pathlib.Path]],
    content: list[tuple[str, pathlib.Path, pathlib.Path]],
    output: pathlib.Path
):
    funcs = []

    for name, path in templates:
        replacement = path.read_text('UTF-8')

        def sub(name, replacement, text):
            return re.sub(r'<!--K\{' + re.escape(name) + r'\}K-->',
                          replacement, text)
    
        funcs.append(functools.partial(sub, name, replacement))
    
    for opath, ipath in content:
        opath = output / opath
        opath.parent.mkdir(parents=True, exist_ok=True)

        try:
            text = ipath.read_text('UTF-8')
        except ValueError:
            opath.write_bytes(ipath.read_bytes())
        else:
            for sub in funcs:
                text = sub(text)
            opath.write_text(text, 'UTF-8')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('templates', 
                        help='A directory to look up template files')
    parser.add_argument('content', help='Root directory')
    parser.add_argument('output', help='A directory to put a result')
    parser.add_argument('-links', help='Config file with files to duplicate')
    ns = parser.parse_args()

    templates_path = pathlib.Path(ns.templates)
    templates = scan_templates(templates_path, templates_path)

    content_path = pathlib.Path(ns.content)
    content = scan_content(content_path, content_path)

    output_path = pathlib.Path(ns.output)
    replace_substitutions(templates, content, output_path)

    if hasattr(ns, 'links'):
        with open(ns.links, 'r') as file:
            lines = file.readlines()

        files = {}

        for line in lines:
            match = re.search(r'^\s*([^=]+)\s*=\s*(.+)\s*$', line)
            
            if match:
                files[match[1]] = match[2]
        
        for dest, src in files.items():
            ipath = output_path / src
            opath = output_path / dest

            opath.parent.mkdir(parents=True, exist_ok=True)
            opath.write_bytes(ipath.read_bytes())

if __name__ == '__main__':
    main()