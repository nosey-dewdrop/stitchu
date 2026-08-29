"""Small backbone + single classification head.

Browser is the deploy target (ONNX -> onnxruntime-web), so the backbone must be
lightweight. Default: mobilenet_v3_small (~2.5M params, quantises well). efficientnet_b0
is available as an option for a small accuracy bump at higher cost.

The head is a single Linear -> num_classes. More fields (sleeveStyle, ...) will each get
their own head later; for D3 stage 2 we ship a single-head model per field so each head
can be trained / re-trained independently as its ambar fills.
"""
import torch.nn as nn
from torchvision import models


def build_model(num_classes: int, backbone: str = "mobilenet_v3_small",
                pretrained: bool = True):
    if backbone == "mobilenet_v3_small":
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        net = models.mobilenet_v3_small(weights=weights)
        in_features = net.classifier[-1].in_features
        net.classifier[-1] = nn.Linear(in_features, num_classes)
    elif backbone == "efficientnet_b0":
        weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
        net = models.efficientnet_b0(weights=weights)
        in_features = net.classifier[-1].in_features
        net.classifier[-1] = nn.Linear(in_features, num_classes)
    else:
        raise ValueError(f"unknown backbone '{backbone}'")
    return net


# Standard ImageNet input pipeline; the ONNX consumer must match these values.
IMG_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def train_transform():
    from torchvision import transforms
    return transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])


def eval_transform():
    from torchvision import transforms
    return transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])
