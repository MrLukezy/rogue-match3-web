"""
处理火焰/冰晶图片：将白色背景替换为透明通道
用法：python make_transparent.py <图片路径> [输出路径]
"""

import sys
import os
from PIL import Image
import numpy as np


def make_transparent(img_path, output_path=None):
    img = Image.open(img_path).convert("RGBA")
    arr = np.array(img)

    # 白色/亮色背景阈值检测
    # 取四个角的平均色作为背景色
    h, w = arr.shape[:2]
    corners = [
        arr[0, 0],  # 左上
        arr[0, w - 1],  # 右上
        arr[h - 1, 0],  # 左下
        arr[h - 1, w - 1],  # 右下
    ]
    bg_color = np.mean(corners, axis=0).astype(int)

    # 容差：白色背景 ± 50
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    tolerance = 55

    # 判断是否接近背景色（对白/灰/浅色背景都生效）
    diff = np.maximum.reduce(
        [
            np.abs(r.astype(int) - bg_color[0]),
            np.abs(g.astype(int) - bg_color[1]),
            np.abs(b.astype(int) - bg_color[2]),
        ]
    )

    # 生成透明度：背景色越接近=越透明，非背景=不透明
    new_a = np.where(diff <= tolerance, 0, 255).astype(np.uint8)

    # 边缘柔化：alpha 边缘不做硬切，做一次轻微blur再threshold
    from scipy import ndimage

    new_a_fuzzy = ndimage.minimum_filter(new_a, size=3)
    new_a_fuzzy = ndimage.maximum_filter(new_a_fuzzy, size=2)

    # 边缘区域用渐变替代硬边界
    edge_mask = (new_a != new_a_fuzzy) & (new_a == 255)
    new_a[edge_mask] = 180

    arr[:, :, 3] = new_a

    result = Image.fromarray(arr, "RGBA")

    if output_path is None:
        name, ext = os.path.splitext(img_path)
        output_path = f"{name}_transparent.png"

    result.save(output_path, "PNG")
    print(f"  -> Saved: {output_path}")

    # 统计透明像素比例
    transparent_ratio = (new_a == 0).sum() / new_a.size
    print(
        f"    transparent: {transparent_ratio:.1%}, opaque: {1 - transparent_ratio:.1%}"
    )


if __name__ == "__main__":
    base = r"D:\lukezy\MiniGame\rogue-match3\assets\images\effects"

    sources = [
        ("src_flame_a.png", "flame_ring_frame1.png"),
        ("src_flame_b.png", "flame_ring_frame2.png"),
        ("src_flame_c.png", "flame_ring_frame3.png"),
        ("src_ice_a.png", "ice_ring_frame1.png"),
        ("src_ice_b.png", "ice_ring_frame2.png"),
        ("src_ice_c.png", "ice_ring_frame3.png"),
    ]

    for src, dst in sources:
        src_path = os.path.join(base, src)
        dst_path = os.path.join(base, dst)
        print(f"Processing: {src}")
        make_transparent(src_path, dst_path)

    print("\nAll done!")
