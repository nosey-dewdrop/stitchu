# corpus — Track B v1 training images
First batch: 70 images fetched from Wikimedia Commons / Openverse via ../fetch-corpus.sh
(md5 dedupe, <200px filtered, per-file source + license info in manifest.json).
Full capacity: LIMIT=500 ./vision/fetch-corpus.sh (rate-limit sleeps included).
Next step: batch-label via the worker with x-app-token (20/min, no public fuse), then
train the small per-attribute student model (browser ONNX) against the Opus labels.
