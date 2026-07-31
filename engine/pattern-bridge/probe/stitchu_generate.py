# stitchu probe: generate one fitted dress pattern with a fixed tag (determinism check).
# Usage: PYTHONPATH=. ./.venv/bin/python stitchu_generate.py <out_dir>
import sys
from pathlib import Path
import yaml

from assets.garment_programs.meta_garment import MetaGarment
from assets.bodies.body_params import BodyParameters

out_dir = Path(sys.argv[1])
body = BodyParameters('./assets/bodies/mean_all.yaml')
with open('./stitchu_fitted_dress.yaml') as f:
    design = yaml.safe_load(f)['design']

piece = MetaGarment('stitchu_dress', body, design)
pattern = piece.assembly()
if piece.is_self_intersecting():
    print(f'{piece.name} is Self-intersecting')

folder = pattern.serialize(
    out_dir, tag='', to_subfolder=True,
    with_3d=False, with_text=False, view_ids=False,
    with_printable=True)
print(f'Saved to {folder}')
