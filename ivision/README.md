# iVision 無線影像辨識套件手冊

 - 目前版本：0.9D
 - 最新線上版網址：https://flagtech.github.io/ivision/ 
 - PDF 版本下載網址：http://flagtech.github.io/ivision/iVision.pdf

## 安全性與操作須知

- 若您的 iTank 上有安裝 iArm 手臂，**請注意手臂前方與上方保持淨空，避免被手臂打到**。
- iTank 加裝 iVision 套件之後請以電池供電，因為影像辨識的耗電量較大，若以 DC 變壓器供電將會導致 iVision 無法穩定運作。
- iTank 電池充電從 0% 到 100% 的時間大約是 4 小時，請勿過長時間充電以免造成電池損害。

## iVision 硬體介紹

iVision 為 iTank 專用的無線影像辨識套件，須固定在 iTank 上使用。若您想要自行組裝 iVision，請參見本手冊的『[將 iVision 組裝在 iTank](#將-ivision-組裝在-itank)』段落。

iVision 套件由以下兩個硬體組成：

1. iVision 主機
2. iVision 鏡頭

![iVision由兩個硬體組成](https://flagtech.github.io/ivision/images/iVision由兩個硬體組成.jpg)

iVision 主機的主要元件如下：

 1. 電壓顯示計
 2. 狀態燈 (紅+綠)
 3. 模式切換按鈕
  
![iVision主機的主要元件](https://flagtech.github.io/ivision/images/iVision主機的主要元件.jpg)

## 第一次啟動 iVision

 1. 請開啟 iTank 電源，此時 iVision 上的電壓顯示計會顯示目前電池的電壓 (單位是伏特 V)，當電池充飽電時電壓會在 12.0 左右，若電壓顯示低於 10.0，請儘快將電池充電。

    ![電壓顯示計顯示目前電池的電壓](https://flagtech.github.io/ivision/images/電壓顯示計顯示目前電池的電壓.jpg)
 
 2. 如下將 iTank 的 UART 開關撥到最上方的 A 位置，並且將 DIP_SW 的 1-4 開關全部撥到下方 OFF 位置：

    ![設定UART與DIP開關](https://flagtech.github.io/ivision/images/設定UART與DIP開關.jpg)

 3. 在 iTank 的 LCD 中選擇 **I2C Control** 並按二下 **K3** 鈕，若有安裝 iArm 手臂的話，此時手臂會轉成 Z 字型，表示 iTank 已由 Arduino 預錄程式掌控。

    1. 確認目前反白游標為 I2C Control，然後按下 K3 鈕

       ![I2CControl-1](https://flagtech.github.io/ivision/images/I2CControl-1.jpg)

       > 按 K0 鈕可將反白游標向上移動；按 K1 鈕則是將反白游標向下移動；按 K3 鈕表示選取/確認。
    
    2. 在以下畫面再按 K3 鈕確認

       ![I2CControl-2](https://flagtech.github.io/ivision/images/I2CControl-2.jpg)
    
    3. 出現初始化訊息，稍待幾秒後，畫面會閃爍並消失

       ![I2CControl-3](https://flagtech.github.io/ivision/images/I2CControl-3.jpg)

 4. 等待 iVision 開機，iVision 通電後到開機完畢需要大約 40 秒，開機過程中會依序顯示以下燈號：

    1. **綠燈長亮、紅燈熄滅**：代表已經通電，準備載入系統核心。
    2. **綠燈長亮、紅燈長亮**：已經載入系統核心，系統正在開機啟動相關服務中。
    3. **綠燈每秒快閃兩下、紅燈熄滅**：已經開機完畢，Wi-Fi 進入 AP 模式 (關於 Wi-Fi 模式請參見本手冊的『[iVision Wi-Fi 模式](#ivision-wi-fi-模式)』段落)。
    
 5. iVision 開機完畢後，iTank 的 LCD 會顯示目前 iVision 的 Wi-Fi SSID 基地台名稱：

    ![LCD顯示AP模式SSID](https://flagtech.github.io/ivision/images/LCD顯示AP模式SSID.jpg) 

    以上圖為例，iVision 的 Wi-Fi SSID 基地台名稱是『iVision-389d08』。

 6. 開啟電腦或是手機的 Wi-Fi，連線 iTank LCD 上顯示的 Wi-Fi SSID 基地台名稱，預設密碼是 12345678。
 
 7. Wi-Fi 連線成功後，請開啟 Chrome 瀏覽器，連線 http://192.168.5.1 ，連線後即可看到 iVision 傳來的影像： 

    ![iVision首頁](https://flagtech.github.io/ivision/images/iVision首頁.jpg)
 
 8. 按選單上的『搖桿控制』，可以立刻遙控 iTank 前進後退左右轉，以及手臂上下擺動、爪子開合：

    ![iVision選單-搖桿控制](https://flagtech.github.io/ivision/images/iVision選單-搖桿控制.jpg)

    若使用手機，請將手機橫擺，左邊的搖桿可以控制 iTank 前進後退左右轉，右邊的搖桿控制手臂上下擺動、爪子開合：

    ![搖桿控制畫面](https://flagtech.github.io/ivision/images/搖桿控制畫面.jpg)

## iVision Wi-Fi 模式

iVision 支援 AP 與 STA 兩種 Wi-Fi 模式，兩種模式下 iVision  的 IP 位址有所不同。

#### AP 模式

iVision 自己作為 Wi-Fi 基地台，您的電腦或手機的 Wi-Fi 連到 iVision 的 Wi-Fi 基地台之後，便可以控制 iVision。

![AP模式示意圖](https://flagtech.github.io/ivision/images/AP模式示意圖.jpg)

#### STA 模式

iVision 連到您家中或是學校的 Wi-Fi 基地台，您的電腦或是手機也必須連到同一個基地台，才能控制 iVision 。

![STA模式示意圖](https://flagtech.github.io/ivision/images/STA模式示意圖.jpg)

#### 找出 iVision 的 Wi-Fi 模式與 IP

當 iTank 的 LCD 第一行顯示 AP SSID 時，表示 iVision 目前是 AP 模式，自己作為 Wi-Fi 基地台：

![LCD顯示AP模式SSID](https://flagtech.github.io/ivision/images/LCD顯示AP模式SSID.jpg) 

以上圖為例，iVision 的 Wi-Fi SSID 基地台名稱是『iVision-389d08』，請連線這個 Wi-Fi 基地台名稱 (預設密碼是 12345678)，然後用 192.168.5.1 即可控制 iVision。

> 請注意！若曾經修改過 Wi-Fi 模式的設定，那麼 AP 模式的 Wi-Fi 連線密碼以及 IP 可能也會隨之更改，請依照您修改過的設定來連線。

若 iTank 的 LCD 第一行顯示 STA IP 時，表示 iVision 目前是 STA 模式，此時 iVision 的 IP 會由您的基地台分配，所以 IP 位址並不固定，請參見 iTank LCD 顯示的 IP 來連線 iVision。

![LCD顯示STA模式IP](https://flagtech.github.io/ivision/images/LCD顯示STA模式IP.jpg)

以上圖為例，iVision 的 IP 是 192.168.100.101。

#### 用瀏覽器設定 Wi-Fi 模式

請參見本手冊的『[找出 iVision 的 Wi-Fi 模式與 IP](#找出-ivision-的-wi-fi-模式與-ip)』段落，完成 Wi-Fi 連線，並找出 iVision 的 IP。

然後請開啟 Chrome 瀏覽器，連線 http://iVision的IP ，然後按選單上的『Wi-Fi』：

![iVision選單-WiFi](https://flagtech.github.io/ivision/images/iVision選單-WiFi.jpg)

若看到登入畫面，請輸入帳號密碼登入 (預設帳號與密碼皆為 admin)：

![iVision登入](https://flagtech.github.io/ivision/images/iVision登入.jpg)

登入後即可修改 Wi-Fi 設定：

![WiFi設定](https://flagtech.github.io/ivision/images/WiFi設定.png)

> 請注意！除非您對於網路架構很熟悉，否則建議不要修改『本機 AP IP』與『本機 AP 子網路遮罩』這兩個設定。

修改完畢後，請按套用鈕，等待 10-30 秒讓設定生效。

## 透過 iVision 遠端視訊遙控 iTank

#### 以 Android/iPhone 手機或電腦瀏覽器進行遠端視訊遙控

請參見本手冊的『[找出 iVision 的 Wi-Fi 模式與 IP](#找出-ivision-的-wi-fi-模式與-ip)』段落，完成 Wi-Fi 連線，並找出 iVision 的 IP。

然後請開啟 Chrome 瀏覽器，連線 http://iVision的IP ，然後按選單上的『搖桿控制』，即可一邊觀看遠端的影像，一邊遠端操控 iTank：

![iVision選單-搖桿控制](https://flagtech.github.io/ivision/images/iVision選單-搖桿控制.jpg)

若使用手機，請將手機橫擺，左邊的搖桿可以控制 iTank 前進後退左右轉，右邊的搖桿控制手臂上下擺動、爪子開合：

![搖桿控制畫面](https://flagtech.github.io/ivision/images/搖桿控制畫面.jpg)

若無法連線的話，請確認您的 Wi-Fi 是否連線正確的 AP 基地台，以及檢查 iVision IP 是否正確。

#### 以 Android 手機 App 進行遙控

請參見本手冊的『[找出 iVision 的 Wi-Fi 模式與 IP](#找出-ivision-的-wi-fi-模式與-ip)』段落，完成 Wi-Fi 連線，並找出 iVision 的 IP。

然後請透過 Android 手機的 Play 商店安裝『**旗標 iVision Wifi 視訊機器手臂車**』 App，或者請點[此連結下載 APK 檔](http://ivision.iurl.org/Android/FlagTankVision.apk)直接安裝。

安裝完畢後，請開啟『旗標視訊Wifi視訊機器手臂車』App，在 IP 欄位輸入剛剛找到的 iVision IP，然後按『確定』鈕，連線後會出現連線成功的訊息：

![AndroidApp-01](https://flagtech.github.io/ivision/images/AndroidApp-01.jpg)

若無法連線的話，請確認您的 Wi-Fi 是否連線正確的 AP 基地台，以及檢查 iVision IP 是否正確。

接著請勾選『攝影機』項目，便可以看到 iVision 的視訊影像：

![AndroidApp-02](https://flagtech.github.io/ivision/images/AndroidApp-02.jpg)

若您想要遠端遙控 iTank 前進、後退或左右轉，請勾選『可開車』項目，App 下方就會出現方向按鈕。若手機畫面過小看不到全部的方向按鈕，請勾選影片的『半高』項目，可以讓視訊的螢幕佔比縮小一半：

![AndroidApp-03](https://flagtech.github.io/ivision/images/AndroidApp-03.jpg)

如果想要遠端遙控 iTank 上的手臂，請勾選『機器手臂』項目，然後向上拖曳 App 下方按鈕區，就可以看到手臂的相關操控按鈕：

![AndroidApp-04](https://flagtech.github.io/ivision/images/AndroidApp-04.jpg)

完成所有選項設定後，可以取消勾選『選項設定』項目，讓 App 下方按鈕區變大以方便操控：

![AndroidApp-05](https://flagtech.github.io/ivision/images/AndroidApp-05.jpg)

本 App 程式是使用 App Invertor 2 所製作的，若想要自行修改或撰寫新程式，請先下載以下專案檔：

 - [FlagTankVision.aia](https://flagtech.github.io/ivision/Android/FlagTankVision.aia)

然後登入 [http://ai2.appinventor.mit.edu](http://ai2.appinventor.mit.edu) 網站 (若無帳號可免費申請)，匯入剛剛下載的 FlagTankArm.aia 專案檔，即可進行更改 (請先將 App Invertor 2 介面切換到繁體中文，才能正確編譯)。

## iVision 以顏色自動追物

本套件內附的 Arduino 上已經預錄了一個自動追物的程式，可以自動追蹤跟隨 RGB 值為 240, 93, 23 的橘色物體。

> 本程式是以『SUPER-K 兒童5寸PU發泡籃球』這個產品的顏色為基準進行開發。若要更改追蹤的顏色，請參見本手冊的『[更改追蹤的顏色](#更改追蹤的顏色)』段落。

#### 尋找物體 

重複按 iTank LCD 下方的 K0 鈕，一直到 LCD 第 3 行顯示 『->Find』之後，按 K3 鈕確認：

![自動追物Find-1](https://flagtech.github.io/ivision/images/自動追物Find-1.jpg)

將橘色物體放在 iVision 鏡頭前面，若 iVision 可以辨識到該物體，則會將辨識到的物體資訊顯示在 iTank LCD 上：

![自動追物Find-2](https://flagtech.github.io/ivision/images/自動追物Find-2.jpg)

 - x, y 表示物體的 x, y 位置，原點在畫面左上方
 - area 是物體的面積
 - r|s 是物體的半徑

#### 追蹤跟隨物體

確認 iVision 可以辨識到您提供的物體，便可以設定讓 iVision 控制 iTank 追蹤跟隨該物體。

重複按 iTank LCD 下方的 K0 鈕，一直到 LCD 第 3 行顯示 『->Goto』，然後將鏡頭前面的物體移遠移近，觀察 LCD 上 r|s 的物體的半徑值確認 iVision 有看到該物體，然後按 K3 鈕確認：

![自動追物Goto](https://flagtech.github.io/ivision/images/自動追物Goto.jpg)

此時移動鏡頭前面的物體，即可看到 iTank 自動跟隨物體移動。

iVision 會依照物體的半徑值來判斷物體與 iTank 的距離，以上圖為例若設定為 62，之後若物體半徑變小低於 62，表示物體遠離，所以 iTank 會往前移動以追隨物體；反之若物體接近，iTank 便會往後拉開距離；一旦物體半徑剛好等於 62 時，iTank 就會停止。

> 當電力變弱或地面阻力大時，您可以將 iTank 上 DIP_SW 的 4 號開關撥到上方 ON 位置，即可增加馬力輸出。

#### 更改追蹤的顏色 

請參見本手冊的『[找出 iVision 的 Wi-Fi 模式與 IP](#找出-ivision-的-wi-fi-模式與-ip)』段落，完成 Wi-Fi 連線，並找出 iVision 的 IP。

然後請開啟 Chrome 瀏覽器，連線 http://iVision的IP ，然後按選單上的『影像辨識/OpenCV 啟動與設定』：

![iVision選單-OpenCV](https://flagtech.github.io/ivision/images/iVision選單-OpenCV.png)

若看到登入畫面，請輸入帳號密碼登入 (預設帳號與密碼皆為 admin)：

![iVision登入](https://flagtech.github.io/ivision/images/iVision登入.jpg)

登入後即可如下更改追蹤的顏色：

![更改OpenCV追蹤的顏色-1](https://flagtech.github.io/ivision/images/更改OpenCV追蹤的顏色-1.jpg)

完成設定後可以如下檢視辨識結果：

![更改OpenCV追蹤的顏色-2](https://flagtech.github.io/ivision/images/更改OpenCV追蹤的顏色-2.jpg)

![更改OpenCV追蹤的顏色-3](https://flagtech.github.io/ivision/images/更改OpenCV追蹤的顏色-3.jpg)

> 影像辨識的結果會依照現場的光線或背景而有差異，您可以調整誤差容許值來改善辨識結果

## 用按鈕切換 Wi-Fi 模式/歸零重設

除了使用瀏覽器更改 Wi-Fi 模式以外，您也可以使用模式切換按鈕來快速切換 Wi-Fi 模式，或者將 iVision 所有設定歸零。

模式切換按鈕的動作與燈號如下：

![按鈕動作與燈號](https://flagtech.github.io/ivision/images/按鈕動作與燈號.png)

> 以按鈕切換為 STA 模式之前，請參見本手冊的『[用瀏覽器設定 Wi-Fi 模式](#用瀏覽器設定-wi-fi-模式)』段落，先設定好 STA 模式下 iVision 要連線哪一個 AP。

## 撰寫 Arduino 程式控制 iVision

**旗標**科技提供了 iVision 專用的函式庫，Arduino 程式內直接呼叫函式庫提供的函式，即可傳送或接收 iVision 的資料。

> 只要使用 iVision 函式庫撰寫或修改 Arduino 程式，即使覆蓋了 Arduino 上的出廠預錄程式，也不會影響 iVision 網頁或 App 的操控。

#### 安裝 iVision 函式庫

請先使用瀏覽器下載以下函式庫檔案：

 - [FlagTank.zip](https://flagtech.github.io/ivision/Arduino/FlagTank.zip)
 - [FlagTankVision.zip](https://flagtech.github.io/ivision/Arduino/FlagTankVision.zip)
 - [FlagTankArm.zip](https://flagtech.github.io/ivision/Arduino/FlagTankArm.zip)
 - [PS2X_lib.zip](https://flagtech.github.io/ivision/Arduino/PS2X_lib.zip)

然後請開啟 Arduino IDE，參考下圖加入 **FlagTank.zip**、**FlagTankVision.zip**、**FlagTankArm.zip**、**PS2X_lib.zip** 等函式庫檔案，以便後續撰寫 Arduino 程式。

![Arduino加入ZIP函式庫](https://flagtech.github.io/ivision/images/Arduino加入ZIP函式庫.png)

> FlagTankArm.zip、PS2X_lib.zip 是 iArm 手臂的函式庫，因為本套件預錄程式也有包含手臂相關控制，所以請一併加入手臂的函式庫，以便之後可以還原預錄程式。

#### 使用 iVision 函式庫

若要在 Arduino 程式中使用 iVision 函式庫，請先在 Arduino 程式最前面引入以下 2 個 .h 檔案：

```cpp
#include <FlagTank.h>        // 引用 iTank 函式庫
#include <FlagTankVision.h>  // 引用 iVision 函式庫
```

iVision 函式庫已預先定義好了 iVision 物件,  所以程式可以直接使用此物件來控制或取得 iVision 辨識結果。

在 Arduino 的 setup() 函式中如下進行初始化，並且控制 iVision 尋找橘色的物體：

```cpp
void setup() {
  // 初始化 Serial (以便和 iVision 的 UART 連線)
  iVision.initSerial();

  // 等待 iTank 就緒
  iTank.begin();

  // 等待 iVision 就緒
  iTank.writeLCD(0, "Wait iVision...");
  bool wait = true;
  while(wait) {
    // 取得 iVision 版本, 若取到表示 iVision 已經就緒
    iVision.getVersion();
    delay(500);
    while(iVision.read()) {
      if(iVision.type=='v') { 
        wait = false; 
        break;
      }    
    }
  }
  iTank.writeLCD(0, "iVision Ready");

  // 開始尋找 RGB 值為 240, 93, 23 的橘色物體
  // H、S、V 誤差容許範圍為 +-4, +-40%, +-100%
  iVision.findColor({240, 93, 23, 4, 40, 100}, 6);

  // 清除之前尚未讀取的 iVision 訊息
  while(iVision.read());
}
```
 
然後即可在 Arduino 的 loop() 函式取得 iVision 辨識到的橘色物體相關資訊：

```cpp
void loop() {
  delay(1); // 避免跑太快(造成iTank或其他硬體反應不及), 若不Delay每秒可跑4萬多圈 
  
  while(iVision.checkRead()) {   // 不斷讀取資料並處理, 直到沒有資料為止
    iVision.read();         // 讀取資料

    if(iVision.type=='r') {
      char blank[] = "    ";
      
      // 在 LCD 顯示物體座標
      iTank.writeLCD(3, String("x,y = ")+iVision.x+","+iVision.y+blank);

      // 在 LCD 顯示物體面積
      iTank.writeLCD(4, String("area= ")+iVision.area+blank);

      // 在 LCD 顯示物體半徑
      iTank.writeLCD(5, String("r|s = ")+iVision.r+blank);
    }
  }
}
```
 
## iVision for Arduino 函式與屬性說明

#### iVision.initSerial()

- 說明

    初始化 Serial 通道，以便與 iVision 溝通。

- 語法

    iVision.initSerial(long baud)

- 參數

    - baud：非必須參數，指定 Serial Baudrate，若未指定的預設值為 19200。

- 傳回值

    無

-----------------------------------------------------------------------

#### iVision.getVersion()

- 說明

    查詢 iVision 版本。

- 語法

    iVision.getVersion()

- 參數

    無

- 傳回值

    無

-----------------------------------------------------------------------

#### iVision.findColor()

- 說明

    設定 iVision 以顏色來辨識物體。

- 語法

    iVision.findColor(byte rgb_hsv[], byte len=3)

- 參數

    - rgb_hsv：內含至少 3 bytes，指定 R (紅)、G (綠)、B(藍) 的顏色值，也可以有 4~6 個 bytes，指定 H (色彩或稱色相)、S (飽和度%)、V (明亮度%) 的範圍。

        - RGB範圍:0-255, H範圍:0-359度, SV範圍:0-100%。
        - RGB是指定顏色的值, HSV是指定顏色的範圍, 例如H設為2, 則指定顏色的色彩值『由減2到加2』之間的顏色都符合
        - HSV若未指定, 則均會自動設定為其預設值: 4、40、100。
        - 在計算S或V的誤差容許範圍時, 上限值若大於100會改為100, 下限值若小於20會改為20。設為100時, 會自動變成 20%~100% 範圍

    - len：非必須參數，為 rgb_hsv 陣列長度 (3~6)，若省略此參數則預設為 3

- 傳回值

    無

-----------------------------------------------------------------------

#### iVision.findCircle()

- 說明

    設定 iVision 辨識圓形物體。

- 語法

    iVision.findCircle()

- 參數

    無

- 傳回值

    無

-----------------------------------------------------------------------

#### iVision.findSquare()

- 說明

    設定 iVision 辨識方形物體。

- 語法

    iVision.findSquare()

- 參數

    無

- 傳回值

    無

-----------------------------------------------------------------------

#### iVision.findStop()

- 說明

    設定 iVision 停止辨識。

- 語法

    iVision.findStop()

- 參數

    無

- 傳回值

    無

-----------------------------------------------------------------------

#### iVision.checkRead()

- 說明

    檢查是否有資料可讀取 

- 語法

    iVision.checkRead()

- 參數

    無

- 傳回值

    布林值 (boolean)

-----------------------------------------------------------------------

#### iVision.read()

- 說明

    讀取 iVision 傳來的訊息

- 語法

    iVision.read()

- 參數

    無

- 傳回值

    char 字元，代表讀到訊息的種類，訊息的種類如下：

    - 0x00：沒讀到資料
    - r：圓形或顏色辨識物體的資訊
    - s：多邊形物體的資訊
    - t：要傳給 iTank 的指令
    - v：版本資訊
    - e：錯誤訊息

-----------------------------------------------------------------------

#### iVision.x

- 辨識到的物體的中心點 x 座標，原點在畫面左上角

-----------------------------------------------------------------------

#### iVision.y

- 辨識到的物體的中心點 y 座標，原點在畫面左上角

-----------------------------------------------------------------------

#### iVision.r

- 辨識到的物體的半徑 (圓形) 或端點數 (多邊形)

-----------------------------------------------------------------------

#### iVision.area

- 辨識到的物體的面積

## 還原 Arduino 預錄程式

請參見本手冊的『[安裝 iVision 函式庫](#安裝-ivision-函式庫)』段落，安裝好所有相關的函式庫檔案。

然後請開啟 Arduino IDE，執行『檔案/範例/FlagTankVision/iVision_Preload』命令開啟 iVision 預錄程式，將此程式上傳 Arduino 即可還原預錄程式。 

## 撰寫 Python/C#/VB/Java 程式遠端視訊遙控 iVision

iVision 提供 HTTP 視訊串流以及 HTTP API，所以只要您使用的程式語言有 HTTP 相關函式庫或物件，即可用來取得遠端視訊，以及進行遠端遙控。

#### 視訊串流

- 視訊網址：http://iVision的IP/stream 串流格式為 MJPEG

- 圖片網址：http://iVision的IP/image.jpg 圖片格式為 JPEG

#### HTTP API

HTTP API 會以 json 的格式回傳結果。

##### 控制 iTank 行進方向

http://iVision的IP/api?setitank&dir=[方向]&speed=[速度]

- 方向：F (前進)、B (後退)、R (右轉)、L (左轉)、S (停止)，方向字元可混和，例如 FR 表示右前方。

- 速度：非必須參數，可使用的值為 1-7，數字越大速度越快。若未指定則預設值是 2。

##### 傳送 UART 指令給 iTank

http://iVision的IP/api?setserial=[UART指令]

- UART指令：請使用 %FF 來表示 16 進位 0xFF，例如 %FF%FF%07%21%FF%FF%00 指令會設定 Servo1 的角度為 33 度。

## 燈號狀態說明

**開機過程綠燈會保持長亮**，關於開機過程的燈號狀態，請參見本手冊的『[第一次啟動 iVision](#第一次啟動-ivision)』段落。

開機後若一切正常，紅燈會熄滅。當 iVision 處於 **AP 模式，綠燈會每秒快閃兩下**；如果處於 **STA 模式，綠燈會每秒閃一下**。

若您以按鈕切換模式時，也會有相對應的燈號，請參見本手冊的『[用按鈕切換 Wi-Fi 模式/歸零重設](#用按鈕切換-wi-fi-模式歸零重設)』段落。

## 錯誤排除

##### 無法開機

通常是因為電池的電量不足，請透過電壓指示計檢查，若低於 10.0 V，請儘快充電。

##### 無法透過網路連線

開機後 AP 模式綠燈每秒快閃兩下，STA 模式綠燈會每秒閃一下，若亮起紅燈，表示網路發生錯誤，請如下處理：

- AP 模式錯誤：請按兩下模式切換按鈕讓系統重設一次 AP 模式的設定。
    
- STA 模式錯誤：請按三下模式切換按鈕讓系統重設一次 STA 模式的設定，若仍然發生錯誤，請檢查 iVision 要連線的 Wi-Fi AP 基地台是否正常，確認正常後，請按三下模式切換按鈕讓系統重設一次 STA 模式的設定。
    
若仍然無法排除網路錯誤，請參見本手冊的『[用按鈕切換 Wi-Fi 模式/歸零重設](#用按鈕切換-wi-fi-模式歸零重設)』段落，按四下按鈕讓系統設定歸零，然後用 AP 模式的方式連線 iVision 重新設定一次網路。

## 將 iVision 組裝在 iTank

(即將提供)

## iVision 硬體規格

iVision 主機：

 - CPU：Allwinner H3 (Cortex-A7 四核心) 
 - GPU：Mali400MP2 (OpenGL ES2.0) 
 - RAM：1GB DDR3 (與GPU共用) 
 - FlashROM：8GB 
 - WiFi 802.11n 2.4GHz (含 IPEX 外接天線) 
 - USB 2.0 x3 
 - 40-pin GPIO 接腳 (相容 Raspberry Pi) 
 - 輸入電壓：DC 5V 
 - 按鈕 x1
 
iVision 鏡頭： 

- 像素：200萬
- 最高解析度：1280X960
- 感光元件類型：CMOS
