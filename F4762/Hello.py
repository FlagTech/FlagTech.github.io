# 每個字母的點狀圖案
patterns = {
    'H': ["*   *", "*   *", "*****", "*   *", "*   *"],
    'e': ["*****", "*    ", "*****", "*    ", "*****"],
    'l': ["*    ", "*    ", "*    ", "*    ", "*****"],
    'o': [" *** ", "*   *", "*   *", "*   *", " *** "],
    'W': ["*   *", "*   *", "*   *", "* * *", " * * "],
    'r': ["**** ", "*   *", "**** ", "* *  ", "*  * "],
    'd': ["   * ", "   * ", "**** ", "*   *", "**** "]
}

# 組合 "Hello World"
hello_world = []
for word in ["H", "e", "l", "l", "o", "W", "o", "r", "l", "d"]:
    if hello_world:
        # 將每個字母的行合併
        for i in range(len(patterns[word])):
            hello_world[i] += "  " + patterns[word][i]
    else:
        # 初始化 hello_world 為第一個字母的圖案
        hello_world = patterns[word][:]

# 將結果輸出
for line in hello_world:
    print(line)
