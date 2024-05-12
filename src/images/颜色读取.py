import cv2

# 读取图片
image = cv2.imread('./logo.jpeg')

# 指定像素点坐标（假设为 (x, y)）
# x = 100
# y = 200

# 获取像素点的 RGB 值
(b, g, r) = image[1, 1]

# 打印 RGB 值
print(f"RGB 值：({r}, {g}, {b})")