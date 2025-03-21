import argparse
import pathlib
import re
import functools

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
    ns = parser.parse_args()

    templates_path = pathlib.Path(ns.templates)
    templates = scan_templates(templates_path, templates_path)

    content_path = pathlib.Path(ns.content)
    content = scan_content(content_path, content_path)

    replace_substitutions(templates, content, pathlib.Path(ns.output))

if __name__ == '__main__':
    main()