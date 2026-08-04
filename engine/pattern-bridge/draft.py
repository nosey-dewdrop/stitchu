# ============================================================================
# draft.py — run a recipe against a graded body and write the specification.
#
# The whole of the drawing side is data: the recipe is JSON, the body is the
# graded measurement set, and this file only puts the two together. Changing
# size is re-running it with a different size index, not redrawing anything.
# ============================================================================
import argparse
import json
from pathlib import Path

import mapping
import material

HERE = Path(__file__).resolve().parent
SIZES = mapping.SIZES


def build(recipe_path, size='EU38'):
    recipe = material.load(recipe_path)
    body = mapping.graded_body(SIZES.index(size), [])
    return material.draw(recipe, body), body


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('recipe', nargs='?',
                    default=str(HERE / 'drafts' / 'eu38-fitted-dress.json'))
    ap.add_argument('--size', default='EU38', choices=SIZES)
    ap.add_argument('-o', '--out', default='/tmp/material_spec.json')
    args = ap.parse_args()

    spec, _ = build(args.recipe, args.size)
    Path(args.out).write_text(json.dumps(spec, indent=2))
    panels = spec['pattern']['panels']
    print(f"{args.out}: {len(panels)} panels, "
          f"{len(spec['pattern']['stitches'])} stitches, size {args.size}")


if __name__ == '__main__':
    main()
