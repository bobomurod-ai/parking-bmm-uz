# 🚗 PARKING BMM_UZ — Virtual Avtomobil va Parkovka Simulyatori

**Parking BMM_UZ** — Three.js va WebGL asosida yaratilgan, O'zbekiston shahar muhiti, milliy avtomobillar va parkovka missiyalarini o'z ichiga olgan 3D virtual o'yin.

---

## 🌟 O'yin Imkoniyatlari va Xususiyatlari

1. **Milliy Avtomobillar Garaji (UZB Cars)**:
   - 🏎️ **Gentra / Lacetti ("Qorabayir")**: Maxsus spoyler, tonirovka, qotishma disklar va yuqori tezlik.
   - 🚘 **Cobalt LTZ**: Keng, mustahkam, oilaviy shahar sedani.
   - 🚙 **Nexia 3 (Ravon R3)**: Chaqqon, tezlanuvchan va tor ko'chalarda juda qulay.
   - 🚐 **Damas Van ("Afsonaviy Delux")**: Yashil belbog'li klassik mikroavtobus.
   - 🚀 **Malibu 2 Turbo**: VIP biznes klass, qo'shaloq glushitel va eng yuqori dinamika.
   - 🚗 **Spark / Matiz**: Shahar ichida parkovka qiroli, minimal o'lcham va oson burilish.
   - 🎨 Har bir mashinaning rangini (Oq marvarid, Qora, Mokriy asfalt, Kumush, Moviy va h.k.) garajda o'zgartirish imkoniyati.

2. **Katta 3D Shahar Muhiti**:
   - Ko'p polosali asfalt ko'chalar, sariq ajratuvchi chiziqlar va piyodalar o'tish yo'laklari (zebra).
   - O'zbekiston uslubidagi obyektlar: **"UNG PETROL"** (Uzbekneftgaz) benzokalonkasi, **"TOSHKENT MALL"** savdo markazi, ko'p qavatli biznes markazlari va turar-joylar.
   - Daraxtlar, tungi ko'cha chiroqlari va shahar belgilari.

3. **Atrofda Harakatlanuvchi Mashinalar (Trafik AI)**:
   - Shahar ko'chalarida avtonom harakatlanuvchi Nexia, Cobalt, Damas va Spark mashinalari.
   - Ular yo'l polosalarida yuradi, svetofor/to'siqlarda va sizning mashinangiz yaqinlashganda to'xtaydi, tormoz chiroqlari avtomatik yonadi.

4. **Nishonli Parkovka Missiyalari**:
   - Shaharning turli nuqtalarida maxsus parkovka joylari (P).
   - Mashinangiz tepasidagi 3D yo'nalish ko'rsatkichi (kompas/strelka) nishon tomon yo'naltiradi.
   - Parkovka joyiga yaqinlashganda **parktronik audiosi** (pi-pi-pi signali) ishlaydi.
   - Joyga to'g'ri burchak ostida kirib, 2 soniya to'xtab tursangiz — g'alaba fanfari, ball va yangi missiya beriladi!

5. **Spidometr, Mini-Radar va Audio**:
   - Real-vaqtli KM/SOAT spidometri va uzatmalar ko'rsatkichi (D / R / P).
   - 3D minimap radarida sizning avtomobilingiz, trafik mashinalari va nishonli parkovka joyi ko'rinadi.
   - Web Audio API asosidagi procedural dvigatel ovozi, signal (H - Gudok), drift/tormoz ovozi.

6. **Rekordlar Tizimi**:
   - To'plangan ballar, muvaffaqiyatli parkovkalar soni va natijalar kompyuter xotirasida (`localStorage`) saqlanadi.

---

## 🎮 Boshqaruv Tugmalari

| Tugma | Vazifasi |
| :--- | :--- |
| **W** yoki **↑** | Gaz (Oldinga harakat) |
| **S** yoki **↓** | Tormoz / Orqaga yurish |
| **A** yoki **←** | Chapga burilish |
| **D** yoki **→** | O'ngga burilish |
| **SPACE (Bo'shliq)** | Qo'l tormozi (Drayv va Drift) |
| **C** | Kamera rejimini almashtirish (Orqa / Salon-Kapot / Tepadan) |
| **H** | Gudok / Signal chaling |
| **R** | Mashinani yo'lga xavfsiz qayta tiklash |
| **ESC** | Asosiy menyu / Tanaffus |

*Sensorli ekranlar yoki sichqoncha uchun ekranda virtual boshqaruv pedallari va burilish tugmalari ham mavjud.*

---

## 🚀 Ishga Tushirish

1. `START_GAME.bat` fayliga sichqoncha bilan 2 marta bosing (yoki to'g'ridan-to'g'ri `index.html` faylini Google Chrome / Microsoft Edge brauzerida oching).
2. Yoki `SERVER_ORQALI_OCHISH.bat` faylini ishga tushirib `http://localhost:8080` manzilida o'ynang.
