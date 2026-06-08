# Day 16 Submission — Team YourSpace

## Members
- Viet Anh: Founder

---

## 1. Idea reframed

Original idea:
> Ứng dụng cho phép người dùng chụp ảnh không gian phòng, sau đó kéo thả đồ nội thất 3D theo các phong cách thiết kế vào ảnh thực tế, xem chi phí ước tính và mua hàng hoặc nhận tư vấn chuyên gia.

Reframed as a product opportunity:
> Thị trường nội thất Việt Nam đang bị nghẽn ở khâu chuyển đổi do "The Cost of Doubt" (Phí tổn của sự đắn đo). Khách hàng mất 2–4 tuần suy nghĩ trước mỗi món đồ 5–30 triệu vì họ phải "đánh cược" xem nó có hợp không gian không, dẫn đến tỷ lệ bỏ giỏ hàng 30%. **Observed gap:** Thị trường đang vận hành bằng các "Product Catalog" rời rạc thay vì "Style Palette" (trải nghiệm trọn gói theo phong cách). **Founding belief:** Nếu cung cấp một Visual Sales Channel cho phép người dùng "ướm thử" toàn bộ phong cách lên ảnh chụp phòng thật, chúng ta sẽ triệt tiêu hoàn toàn sự đắn đo, biến khao khát thẩm mỹ thành hành vi tự tin chốt đơn.

---

## 2. Customer / Segment Card

- **Segment name:** Young Aesthetes — Người trẻ định hình phong cách sống qua không gian
- **Operational context:** Đang sở hữu hoặc chuẩn bị sở hữu nhà ở / căn hộ đầu tiên tại Việt Nam, thu nhập trung bình-khá, tiếp cận thông tin qua TikTok / Pinterest / Facebook groups (Nghiện Nhà — 500K+ thành viên). Coi không gian sống là sự kéo dài của bản sắc cá nhân — muốn căn phòng phản ánh con người mình, nhưng thiếu công cụ và ngôn ngữ để hiện thực hóa gu thẩm mỹ đó.
- **Recurring workflow:** Lướt mạng xã hội thấy phòng đẹp → lưu ảnh → không biết phong cách tên gì → search Google đọc bài dài → tìm đồ trên Shopee/Lazada → nhắn tin hỏi giá từng shop → tự tưởng tượng đồ có hợp phòng không → đắn đo 2–4 tuần → mua hoặc bỏ cuộc.
- **Pain moment:** Đứng trước quyết định mua một món đồ lớn (sofa, bàn ăn, kệ tivi) giá 5–30 triệu VNĐ mà không có cách nào xem trước nó sẽ trông như thế nào trong chính căn phòng của mình. Kết quả: hoặc mua nhầm rồi hối hận, hoặc không dám mua và tiếp tục sống với không gian không ưng ý.
- **Why now:** (1) Thế hệ 25–35 tuổi đang bước vào giai đoạn mua nhà đầu tiên tại VN, nhu cầu cá nhân hóa không gian tăng mạnh. (2) Hội nhập quốc tế mang phong cách thiết kế toàn cầu (Wabi Sabi, Japandi, Mid-Century…) vào VN, nhưng công cụ hỗ trợ vẫn là zero. (3) Công nghệ 3D/AR trên web đã đủ trưởng thành (Three.js, WebXR) để triển khai mà không cần app store.
- **Access path:** Facebook group "Nghiện Nhà" (500K+ members), TikTok #homedecor VN (tỷ lượt xem), hợp tác với các xưởng/showroom nội thất local đang bán trên Shopee, influencer nội thất trên Instagram/TikTok.

One-sentence description:
> Người trẻ Việt 25–35 tuổi đang và sắp mua nhà  lần đầu, coi không gian sống là biểu hiện của bản sắc cá nhân, khao khát một phong cách thẩm mỹ riêng nhưng chưa có công cụ nào giúp họ khám phá, trải nghiệm, và hiện thực hóa phong cách đó trong chính căn phòng thật.

---

## 3. Need Map (2–3 needs)

### Need #1 (priority) — Biết mình thích cái đẹp, nhưng không tìm được "phong cách của mình"
- **Statement (JTBD):** When tôi nhìn thấy những căn phòng đẹp trên TikTok/Pinterest và cảm thấy "đây đúng là mình" nhưng không biết phong cách đó gọi là gì, các yếu tố tạo nên phong cách đó là gì, I want được hướng dẫn khám phá và "sống thử" trực quan với từng phong cách trong chính căn phòng của mình, so I can tìm thấy bản sắc thẩm mỹ riêng và biết chính xác mình cần gì để hiện thực hóa nó.
- **Current workaround:** Lướt Pinterest/TikTok → lưu ảnh → không biết phong cách tên gì → search Google "phong cách nội thất đẹp" → đọc bài blog dài đầy thuật ngữ → vẫn mơ hồ. Hoặc hỏi trên group Facebook và chờ ai đó trả lời. Kết quả: gu thẩm mỹ vẫn là một cảm giác mơ hồ, không thể hành động.
- **Pain signal:** Câu hỏi phổ biến nhất trên các cộng đồng nội thất: "Phong cách này gọi là gì?", "Tôi thích kiểu này nhưng không biết bắt đầu từ đâu". Người dùng bị choáng ngợp giữa quá nhiều thuật ngữ (Wabi Sabi vs Japandi vs Scandinavian) — và không có cách nào "thử" mà không cam kết tiền bạc.
- **Evidence / proxy evidence:** Từ khóa "phong cách thiết kế nội thất" có 12K+ lượt search/tháng trên Google VN. Hashtag #homedecor trên TikTok VN đạt hàng tỷ lượt xem — nhu cầu tự khám phá gu thẩm mỹ cực lớn nhưng chưa có công cụ hệ thống hóa. Sự bùng nổ của các quiz "Find your interior style" trên Instagram chứng minh nhu cầu "biết mình là ai" qua không gian sống.
- **Why underserved:** Các app nội thất hiện có (IKEA Place, Houzz) xuất phát từ **sản phẩm** — "đây là cái ghế, bạn muốn thử không?". Không có nền tảng nào xuất phát từ **phong cách sống** — "bạn là ai, và không gian nào phản ánh con người bạn?". Nội dung tiếng Việt chủ yếu là blog text dài hoặc video ngắn rời rạc — không cho phép tương tác, thử nghiệm, hay so sánh trực tiếp.

### Need #2 — Thích rồi nhưng không hình dung được trong phòng thật
- **Statement (JTBD):** When tôi đã xác định được phong cách Japandi là "đúng gu" nhưng rất phân vân liệu bộ sofa hay kệ tivi trong phong cách đó có thực sự hợp với căn phòng hiện tại, I want đặt thử toàn bộ bộ sưu tập phong cách đó vào ảnh chụp căn phòng thật của mình, so I can "sống thử" với phong cách đã chọn và tự tin ra quyết định.
- **Current workaround:** Xem ảnh sản phẩm trên Shopee/Lazada/website showroom → tự tưởng tượng → đo đạc thủ công bằng thước rồi đoán. Một số chi thêm tiền thuê nhà thiết kế tư vấn.
- **Pain signal:** Tỉ lệ trả hàng nội thất online rất cao. Người dùng thường mất 2–4 tuần đắn đo trước khi mua một món đồ lớn. Hàng trăm bài/tuần trên group Nghiện Nhà hỏi "Sofa này kê vào phòng tôi có hợp không?".
- **Evidence / proxy evidence:** IKEA Place (AR app) đạt 2 triệu+ lượt tải globally — chứng minh nhu cầu "thử trước khi mua" rất lớn. Tại VN, group "Nghiện Nhà" 500K+ thành viên liên tục có bài hỏi tương tự.
- **Why underserved:** IKEA Place, Houzz chỉ cho thử **từng món đồ lẻ** với catalog nước ngoài. Chưa có nền tảng nào cho phép "sống thử" **cả một phong cách** (toàn bộ bộ sưu tập đồ phối hợp nhau) trong phòng thật — và với sản phẩm/giá Việt Nam.

### Need #3 — Mơ hồ về giá cả và nguồn mua đáng tin
- **Statement (JTBD):** When tôi đã chọn được phong cách Japandi nhưng hoàn toàn mù mờ về chi phí tổng và không biết mua ở đâu cho đúng hàng, I want xem ngay bảng giá tham khảo và nguồn hàng uy tín ngay trong lúc thiết kế, so I can lên ngân sách chính xác và mua đúng chất lượng mà không bị hớ giá.
- **Current workaround:** Nhắn tin hỏi giá từng shop trên Shopee/Facebook → so sánh thủ công → không biết đâu là hàng chính hãng, đâu là hàng nhái → quyết định dựa trên cảm tính hoặc bỏ cuộc vì quá mất thời gian.
- **Pain signal:** "Cùng một kiểu bàn mà shop A bán 3 triệu, shop B bán 12 triệu, không biết chất lượng khác gì." Nhiều người mua phải hàng kém chất lượng vì không có nguồn tham chiếu đáng tin cậy theo phong cách.
- **Evidence / proxy evidence:** Thị trường nội thất VN ước tính ~$5 tỷ USD nhưng cực kỳ phân mảnh, không có nền tảng aggregator phân loại theo phong cách thiết kế. Khảo sát Q&Me (2024): người tiêu dùng trẻ VN sẵn sàng chi thêm 15–20% nếu được đảm bảo nguồn gốc + chất lượng rõ ràng.
- **Why underserved:** Shopee/Lazada phân loại sản phẩm theo công năng (ghế, bàn, tủ) — không theo phong cách thiết kế. Showroom cao cấp có chuyên gia tư vấn nhưng chi phí cao, không tiếp cận được đại chúng. Không có nền tảng nào kết hợp "thử → xem giá → mua" trong một luồng liền mạch.

---

## 4. Strategy Statement

For **người trẻ Việt 25–35 tuổi đang tìm kiếm bản sắc thẩm mỹ riêng cho không gian sống**
who struggle with **không gọi tên được phong cách mình thích, không có cách "sống thử" với một phong cách trước khi cam kết, và cảm thấy lạc lõng giữa hàng ngàn lựa chọn rời rạc**,
our product helps them **khám phá phong cách sống phù hợp với bản thân, trải nghiệm trực quan phong cách đó trong chính căn phòng thật, và tự tin hiện thực hóa nó**
through **một Visual Sales Channel (Kênh bán hàng trực quan) — chuyển đổi từ "Product Catalog" (danh mục sản phẩm đơn lẻ) sang "Style Palette" (trải nghiệm trọn gói theo phong cách), cho phép "sống thử" mô hình 3D trong ảnh chụp phòng thật kèm dự toán ngân sách chi tiết**,
unlike **IKEA Place/Houzz (product-first), Shopee/Lazada (quá nhiều lựa chọn gây tê liệt), và Pinterest (chỉ là cảm hứng, không thể chốt đơn)**,
because we can leverage **Dữ liệu gu thẩm mỹ bản địa (Aesthetic Identity Graph) + Độc quyền phân phối catalog 3D từ các nhà cung cấp nội thất Việt (Supplier Lock-in)**.

---

## 5. Moat Hypothesis

**Moat mechanism:** Tầng 1: B2B Supplier Lock-in + Tầng 2: Aesthetic Identity Graph

If we deploy **1,000+** lượt "sống thử phong cách" trong **phân khúc Young Aesthetes tại VN**, the following improve:
1. **B2B Supplier Lock-in (Độc quyền tài nguyên 3D):** Các nhãn hàng nội thất tầm trung không có khả năng tự phát triển công cụ AR/3D. Khi tham gia YourSpace, họ số hóa toàn bộ catalog sản phẩm thành mô hình 3D. Catalog này bị khóa chặt vào hệ sinh thái YourSpace, tạo ra rào cản chuyển đổi cực lớn đối với các nhà bán lẻ và cản trở đối thủ copy.
2. **Aesthetic Identity Graph (Bản đồ gu thẩm mỹ người Việt):** Mỗi lượt chọn phong cách, phối đồ, lưu/chia sẻ → tích lũy thành dữ liệu "người Việt khao khát sống như thế nào". AI gợi ý phong cách càng dùng càng "hiểu bạn". Shopee biết bạn mua gì, nhưng YourSpace biết bạn khao khát trở thành ai.

Why competitors cannot easily replicate this:
> Các sàn TMĐT khổng lồ như Shopee bị trói buộc vào cấu trúc "Product Catalog" (hàng tỷ sản phẩm tạp nham). Việc chuyển đổi sang "Style Palette" đòi hỏi đập bỏ kiến trúc hiển thị cốt lõi. Trong khi đó, các app AR như Houzz không có hàng hóa nội địa Việt Nam. Khi chúng ta khóa được nguồn cung 3D B2B (Supplier Lock-in) và nắm giữ Aesthetic Graph, chi phí để đối thủ lớn tái tạo sẽ cực kỳ cao.

---

## 6. Initial TAM / SAM / SOM view

| Layer | Estimate | Key assumptions | Confidence |
|---|---|---|---|
| TAM | $9.76 tỷ USD/năm | Tổng thị trường nội thất Việt Nam (CAGR ổn định). Nguồn: Ước tính ngành & Statista. | high |
| SAM | ~$2.5 tỷ USD/năm | Phân khúc nội thất cho người trẻ đô thị (Urban Millennials) mua sắm online, có AOV từ 10-15 triệu VNĐ. | medium |
| SOM | $150 triệu USD (Mục tiêu dài hạn) | Xây dựng Visual Sales Channel, thu phí Affiliate 8% trên giao dịch + Subscription từ nhãn hàng. LTV/CAC dự kiến đạt 12.5x. | low |

**Top 3 unknowns requiring further research:**
1. **Willingness to transact through platform:** Liệu người dùng có sẵn sàng mua nội thất trực tiếp qua YourSpace hay chỉ dùng để "thử" rồi mua ngoài? Cần validate bằng landing page + survey.
2. **Supplier acquisition cost & commitment:** Chi phí và thời gian để onboard các xưởng nội thất Việt lên nền tảng với catalog 3D chất lượng? Liệu họ có sẵn sàng ký độc quyền?
3. **3D asset production scalability:** Chi phí tạo mô hình 3D cho mỗi sản phẩm nội thất là bao nhiêu? Có thể tự động hóa bằng AI (ảnh → 3D model) ở mức chấp nhận được không?

**Judgment:**
- [x] Worth pursuing now
- [ ] Worth pursuing but not now (need to validate [...] first)
- [ ] Not worth pursuing as currently framed

---

## 7. Positioning Note (2 sentences)

**What we are:**
> YourSpace là nền tảng **phong cách sống** (lifestyle platform) đầu tiên tại Việt Nam giúp người trẻ khám phá gu thẩm mỹ cá nhân và "sống thử" với phong cách đó trong chính căn phòng thật — không chỉ thử đồ nội thất, mà tìm thấy **bạn là ai qua không gian sống của bạn**.

**What we are not / not yet:**
> YourSpace không phải app thử nội thất (chúng tôi bắt đầu từ phong cách sống, không phải từ catalog sản phẩm), không phải sàn thương mại điện tử (chưa giữ hàng, chưa logistics), cũng không phải phần mềm thiết kế cho kiến trúc sư — chúng tôi là **người bạn đồng hành giúp bạn biến gu thẩm mỹ thành không gian sống thật**.

---

## 8. Self-assessment before Day 17

Trong 6 mắt xích (Idea → Customer → Need → Strategy → Moat → Market Size), mắt xích nào team đang yếu nhất?

> **Moat (mắt xích 5)** — Data Flywheel + Supplier Lock-in + UGC Network Effect nghe hợp lý về mặt lý thuyết, nhưng hiện tại chưa có proof point thực tế nào. Cụ thể: (1) Cần bao nhiêu data points thì AI gợi ý mới thực sự tốt hơn hẳn so với curated list thủ công? (2) Nhà cung cấp nội thất Việt có thực sự sẵn sàng ký độc quyền digital showcase với một nền tảng mới hay không — hay họ sẽ chờ xem có traffic trước? (3) UGC network effect cần critical mass bao nhiêu user để tự duy trì? Đây là mắt xích mà nếu không đúng, toàn bộ câu chuyện phòng thủ dài hạn sẽ sụp — đối thủ lớn (Shopee, Lazada) hoàn toàn có thể copy tính năng kéo thả 3D mà không gặp rào cản gì.

Open questions chúng tôi muốn khám phá thêm ở Day 17:
1. **MVP scope chính xác:** Phiên bản đầu tiên nên focus vào Need #1 (thử đồ trong phòng thật) hay kết hợp cả Need #2 (khám phá phong cách)? Trade-off giữa depth vs breadth?
2. **Monetization model:** Commission trên giao dịch vs. subscription cho nhà cung cấp vs. freemium cho user — mô hình nào phù hợp nhất cho giai đoạn 0→1?
3. **3D content pipeline:** Nguồn catalog 3D ban đầu lấy từ đâu? Partner với nhà cung cấp để họ tự tạo, hay YourSpace tự build, hay dùng AI sinh 3D từ ảnh 2D?

---

## 9. MVP Boundaries

Dựa trên định vị "Nền tảng phong cách sống" (Style-first) để test giả thuyết cốt lõi nhanh nhất, ranh giới cho phiên bản MVP đầu tiên được xác định như sau:

**In-Scope (Tính năng cốt lõi bắt buộc để test giả thuyết):**
- **Khám phá theo phong cách:** Chọn và duyệt danh mục nội thất được nhóm theo các phong cách (Japandi, Wabi Sabi, Mid-Century...) thay vì theo công năng (Bàn, Ghế).
- **Tương tác 3D cốt lõi:** Upload ảnh chụp phòng thật, sau đó kéo thả, thêm, xóa, xoay, và di chuyển các mô hình 3D trên nền ảnh đó.
- **AI Spatial Placement:** Tự động ước lượng độ sâu (depth map) và tỉ lệ (scale) từ ảnh 2D để khi người dùng kéo thả, đồ nội thất tự động khớp với phối cảnh không gian thực.
- **Roadmap hiện thực hóa:** Hiển thị giỏ hàng tóm tắt dự toán chi phí cho các món đồ đang được "ướm thử" kèm link out tới website nhà cung cấp.

**Out-of-Scope (Tính năng tốt nhưng không cần cho MVP):**
- **Cộng đồng / Mạng xã hội:** Tính năng chia sẻ bản thiết kế để user khác vào xem, bình luận, hoặc "clone" lại (sẽ phát triển ở giai đoạn scale để tạo network effect).
- **Liên hệ / Chat với tư vấn viên:** Nhắn tin trực tiếp với chuyên gia thiết kế trên app.
- **Thanh toán trực tiếp (In-app Checkout):** MVP chưa cần xử lý cổng thanh toán, chỉ cần redirect (chuyển hướng) người dùng sang sàn hoặc website của đối tác.
- **Quét không gian AR/LiDAR:** Thay vì dùng camera quét map 3D không gian thực tế (tốn nguồn lực dev), MVP chỉ cần dùng ảnh 2D tĩnh làm background.
- **Style Quiz AI:** Gợi ý phong cách bằng câu hỏi trắc nghiệm (cần tích lũy đủ dữ liệu interaction của khách hàng trước, sẽ triển khai ở phase sau).

**Non-Goals (Ranh giới đỏ — Sản phẩm sẽ KHÔNG làm):**
- **KHÔNG làm phần mềm vẽ kỹ thuật chuyên nghiệp:** Không hướng tới việc thay thế AutoCAD/SketchUp để đo đạc kích thước chính xác đến từng milimet hay xuất bản vẽ thi công cho thợ.
- **KHÔNG làm sàn E-commerce nặng về vận hành:** Không tự quản lý kho bãi, không tự xử lý logistics, giao hàng hay giải quyết đổi trả (Giữ mô hình asset-light).
- **KHÔNG tự sản xuất nội thất:** Không trở thành một thương hiệu bán lẻ nội thất (như IKEA), chỉ đóng vai trò là nền tảng kết nối (Platform/Aggregator).

---

## 10. PRD Skeleton — Workshop 2

> **Mục tiêu:** Xác định quyết định sản phẩm (Product Decision) ở Tầng 5 (UX & Prototype) — thống nhất **"Cái gì"** và **"Tại sao"**, không đi sâu vào kỹ thuật "Làm thế nào".

---

### 10.1. Problem Statement

> Người trẻ Việt Nam (25–35 tuổi) coi không gian sống là biểu hiện bản sắc cá nhân, nhưng không có công cụ nào giúp họ khám phá gu thẩm mỹ, hình dung phong cách đó trong căn phòng thật, và biết mua gì ở đâu — dẫn đến 2–4 tuần đắn đo cho mỗi quyết định mua nội thất 5–30 triệu VNĐ, tỉ lệ mua nhầm/hối hận cao, hoặc bỏ cuộc hoàn toàn và sống với không gian không ưng ý.

**Tác động kinh tế:**
- Người dùng: Lãng phí trung bình 5–15 triệu VNĐ/lần mua nhầm nội thất + chi phí cơ hội 2–4 tuần research thủ công.
- Thị trường: Ngành nội thất VN ~$5 tỷ USD nhưng cực kỳ phân mảnh, tỷ lệ chuyển đổi online thấp vì thiếu trải nghiệm trực quan.

---

### 10.2. Target User

| Thuộc tính | Mô tả |
|---|---|
| **Tên segment** | Young Aesthetes — Người trẻ định hình phong cách sống qua không gian |
| **Độ tuổi** | 25–35 tuổi |
| **Bối cảnh** | Đang hoặc sắp sở hữu nhà/căn hộ đầu tiên tại thành phố lớn (HCM, HN, Đà Nẵng) |
| **Thu nhập** | Trung bình-khá (15–40 triệu VNĐ/tháng) |
| **Hành vi số** | Lướt TikTok, Pinterest, Facebook group "Nghiện Nhà" (500K+ thành viên) hàng ngày để tìm cảm hứng |
| **Tâm lý cốt lõi** | Coi căn phòng là sự kéo dài bản sắc cá nhân — muốn phòng phản ánh "mình là ai", không phải chỉ "có chỗ ngồi" |
| **Rào cản chính** | Có gu thẩm mỹ nhưng không gọi tên được phong cách, không hình dung được đồ trong phòng thật, không biết mua đâu cho đúng |

---

### 10.3. User Stories

#### User Story #1 — Khám phá phong cách (Need #1)
> **As a** người trẻ đang muốn trang trí phòng nhưng chưa biết mình thích phong cách gì,
> **I want** duyệt qua các phong cách nội thất (Japandi, Wabi Sabi, Mid-Century, Scandinavian…) với hình ảnh minh họa trực quan và mô tả ngắn gọn dễ hiểu,
> **so that** tôi có thể gọi tên được gu thẩm mỹ của mình và biết hướng đi cụ thể thay vì mơ hồ lưu ảnh trên Pinterest.

**Acceptance criteria:**
- Hiển thị tối thiểu 5 phong cách nội thất phổ biến, mỗi phong cách có ảnh minh họa + mô tả đặc trưng (màu sắc, chất liệu, cảm xúc).
- User có thể chọn 1 phong cách để xem toàn bộ catalog đồ nội thất thuộc phong cách đó.
- Thời gian từ lúc mở app đến lúc chọn được phong cách ≤ 60 giây.

#### User Story #2 — Ướm thử trong phòng thật (Need #2)
> **As a** người đã chọn được phong cách Japandi và muốn xem nó trông như nào trong phòng mình,
> **I want** upload ảnh chụp căn phòng thật, rồi kéo thả các món đồ nội thất 3D (sofa, bàn, kệ, đèn) từ phong cách đó vào ảnh, di chuyển, xoay, thêm và xóa tự do,
> **so that** tôi có thể "sống thử" trực quan với phong cách đã chọn trong chính không gian của mình trước khi bỏ tiền mua bất kỳ thứ gì.

**Acceptance criteria:**
- User upload được ảnh phòng (chụp từ điện thoại hoặc chọn từ thư viện).
- Catalog hiển thị đồ nội thất 3D đã được phân loại theo phong cách đã chọn ở bước trước.
- User có thể: kéo thả đồ vào ảnh, di chuyển vị trí, xoay, phóng to/thu nhỏ, và xóa từng món.
- Render mô hình 3D trên nền ảnh 2D mượt mà (≥ 30fps trên thiết bị tầm trung).

#### User Story #3 — Xem dự toán chi phí (Need #3)
> **As a** người đã phối xong căn phòng với các món đồ Japandi ưng ý,
> **I want** xem tổng chi phí ước tính của tất cả đồ đang đặt trong phòng, kèm thông tin giá và link mua từ nhà cung cấp uy tín,
> **so that** tôi có thể lên ngân sách chính xác và bắt đầu mua sắm ngay mà không phải tự tìm kiếm từng món trên Shopee.

**Acceptance criteria:**
- Hiển thị danh sách tất cả món đồ đã đặt vào phòng, kèm: tên sản phẩm, ảnh thumbnail, giá tham khảo (VNĐ).
- Tổng chi phí ước tính tự động cập nhật khi thêm/xóa đồ.
- Mỗi sản phẩm có nút "Xem chi tiết / Mua" redirect ra website hoặc sàn TMĐT của nhà cung cấp.

#### User Story #4 — AI hỗ trợ đặt đồ thông minh trong không gian (In-scope MVP)
> **As a** người đang kéo thả đồ nội thất vào ảnh chụp phòng thật,
> **I want** AI tự động ước lượng độ sâu (depth) và tỉ lệ (scale) của căn phòng từ ảnh, rồi điều chỉnh kích thước và vị trí món đồ cho khớp với phối cảnh thật, phải trông rất thật để tôi có thể ướm không gian của mình
> **so that** đồ nội thất trông tự nhiên và đúng tỉ lệ trong ảnh, thay vì bị lơ lửng, to quá hoặc nhỏ quá so với không gian thật.

**Acceptance criteria:**
- Khi user upload ảnh phòng, AI phân tích ảnh để tạo depth map (bản đồ độ sâu) cơ bản.
- Khi user kéo thả 1 món đồ vào vị trí trong ảnh, hệ thống tự động scale đồ theo depth tại điểm đó (đồ ở xa nhỏ hơn, đồ ở gần to hơn).
- User có thể **override** (chỉnh tay) kích thước/vị trí nếu AI ước lượng sai (Human-in-the-loop).
- User có thể xoay item 360 độ
- Khi xóa đồ, ảnh nền phía sau được khôi phục hợp lý (inpainting cơ bản hoặc hiển thị lại ảnh gốc).
- Thời gian xử lý depth map ≤ 5 giây cho ảnh độ phân giải điện thoại thông thường.

---

### 10.4. MVP Scope

*(Tham chiếu đầy đủ từ Mục 9 — MVP Boundaries ở trên)*

| Phân loại | Nội dung |
|---|---|
| **In-Scope** | (1) Khám phá theo phong cách (category-based browsing), (2) Tương tác 3D cốt lõi (kéo thả, thêm, xóa, xoay trên nền ảnh 2D), (3) AI Spatial Placement — đặt đồ khớp depth/scale tự động, (4) Roadmap hiện thực hóa (giỏ hàng + dự toán + link mua) |
| **Out-of-Scope** | Cộng đồng/mạng xã hội, Chat tư vấn viên, Thanh toán In-app, Quét AR/LiDAR, **Style Quiz AI** (cần tích lũy data khách hàng trước — sẽ triển khai sau khi có ≥ 1,000 user interactions) |
| **Non-Goals** | KHÔNG làm phần mềm kỹ thuật (AutoCAD), KHÔNG làm sàn TMĐT nặng (logistics/kho), KHÔNG tự sản xuất nội thất |

**Scope decision:** *AI Spatial Placement có nằm trong MVP không?*
→ **CÓ.** User vẫn cần quyền chỉnh tay, nhưng nếu thiếu auto depth/scale thì đồ dễ lơ lửng, sai tỉ lệ, trông giả và phá vỡ cảm giác "sống thử thật". → **Giữ trong In-scope** vì đây là yếu tố khiến YourSpace khác biệt với các ứng dụng tự generate full không gian và việc user tự ghép ảnh trên Canva/Photoshop.

---

### 10.5. Success Metrics

| Metric | Định nghĩa | Target (3 tháng đầu) | Tại sao đo metric này |
|---|---|---|---|
| **Activation Rate** | % user hoàn thành luồng: Chọn phong cách → Upload ảnh → Đặt ≥ 1 món đồ vào phòng | ≥ 30% | Đo xem core value "sống thử" có đủ hấp dẫn để user đi hết luồng không |
| **Time-to-Value** | Thời gian từ lúc mở app đến lúc đặt món đồ đầu tiên vào ảnh | ≤ 3 phút | Nếu > 5 phút → UX quá phức tạp, user bỏ cuộc |
| **Save/Share Rate** | % user lưu lại bản thiết kế sau khi phối đồ | ≥ 20% | Proxy cho "intent to buy" — nếu lưu lại nghĩa là đang cân nhắc nghiêm túc |
| **Click-to-Buy Rate** | % user nhấn "Xem chi tiết / Mua" trên ít nhất 1 sản phẩm | ≥ 15% | Đo được liệu user có thực sự muốn hiện thực hóa hay chỉ "chơi thử" |
| **Return Rate (D7)** | % user quay lại app trong vòng 7 ngày | ≥ 25% | Đo retention — nếu thấp, có thể core value chưa đủ mạnh hoặc catalog quá ít |
| **AI Placement Accuracy** | % đồ được AI đặt mà user KHÔNG cần chỉnh lại tỉ lệ/vị trí | ≥ 60% | Đo chất lượng depth estimation — nếu < 40% thì user phải chỉnh tay quá nhiều, UX tệ |

---

### 10.6. Dependencies & Constraints

#### Dependencies (Phụ thuộc bên ngoài)

| Dependency | Mô tả | Rủi ro | Mitigation |
|---|---|---|---|
| **Catalog 3D** | Cần tối thiểu 50–80 mô hình 3D nội thất chất lượng khá, phân bổ đều cho 5 phong cách (10–16 models/phong cách) | Tự tạo 3D tốn thời gian + chi phí | Giai đoạn MVP: sử dụng free/paid 3D assets từ Sketchfab, TurboSquid, CGTrader. Về lâu dài: partner với nhà cung cấp để họ cung cấp 3D scan sản phẩm thật |
| **Dữ liệu giá + nguồn mua** | Cần giá tham khảo và link mua thật cho mỗi sản phẩm 3D | Giá biến động, link hết hạn | MVP dùng giá tham khảo (khoảng giá), cập nhật thủ công hàng tháng. Scale: API tự động crawl giá từ đối tác |
| **3D Rendering Engine** | Rendering 3D trên mobile (React Native + Three.js/Expo GL, hoặc native SceneKit/ARCore) phụ thuộc vào GPU thiết bị | Điện thoại cũ render chậm/lag | Set minimum requirement (iPhone 8+ / Android mid-range 2020+), cung cấp fallback 2D preview cho thiết bị yếu |
| **AI Depth Estimation** | Model ước lượng độ sâu từ ảnh 2D (MiDaS / Depth Anything) để đặt đồ khớp phối cảnh | Độ chính xác depth map phụ thuộc chất lượng ảnh, góc chụp | Cho phép user override thủ công (pinch-to-resize), cung cấp hướng dẫn chụp ảnh tối ưu |

#### Constraints (Giới hạn nguồn lực)

| Constraint | Chi tiết |
|---|---|
| **Team size** | Solo founder — 1 người phụ trách cả product, design, development |
| **Timeline** | MVP cần ship trong 4–6 tuần để kịp validate giả thuyết |
| **Budget** | Bootstrap, chưa có funding — ưu tiên free/low-cost tools (Three.js miễn phí, hosting trên Vercel/Netlify free tier, AI API dùng free quota) |
| **Platform** | App-first (iOS + Android qua React Native / Flutter) — ưu tiên trải nghiệm mobile vì user chụp ảnh phòng bằng điện thoại, tương tác kéo thả trên touchscreen tự nhiên hơn web |
| **Catalog limit** | MVP chỉ cần 5 phong cách × ~15 sản phẩm = ~75 models. Không cần cover tất cả phong cách và sản phẩm |

---

### 10.7. Model Selection Rationale (AI-Specific #1)

**Tính năng AI trong MVP:** Spatial Placement — ước lượng độ sâu căn phòng từ ảnh 2D để đặt đồ nội thất khớp phối cảnh + inpainting khi xóa đồ.

| Tiêu chí | Lựa chọn | Lý do |
|---|---|---|
| **Depth Estimation** | **Depth Anything V2** (open-source, chạy on-device) hoặc **MiDaS** (Intel) | Chạy local trên điện thoại (không cần API call) → zero latency, zero cost/request. Depth Anything V2 small (~25MB) đủ chính xác cho use case "scale đồ theo phối cảnh" |
| **Inpainting (xóa đồ)** | **LaMa** (open-source) hoặc fallback đơn giản (hiện lại ảnh gốc tại vùng bị che) | LaMa nhẹ, chạy on-device được. MVP có thể dùng fallback đơn giản: lưu ảnh gốc → khi xóa item → reveal lại pixel gốc phía dưới |
| **Tại sao không dùng cloud API (GPT-4o Vision, Gemini)?** | Depth estimation cần real-time (mỗi lần drag đồ), gửi API mỗi frame là không khả thi về latency và chi phí | On-device inference là bắt buộc cho UX mượt |
| **Tại sao không dùng ARKit/ARCore full?** | Yêu cầu camera live + quét không gian → phức tạp, Out-of-scope MVP. Depth from single image đủ tốt cho "ướm thử" | Giảm ma sát: user chỉ cần 1 ảnh chụp, không cần quét phòng |
| **Trade-off chấp nhận được** | Depth từ ảnh 2D kém chính xác hơn LiDAR/ARKit (~±15-20% sai số) nhưng đủ cho trải nghiệm trực quan. User có thể chỉnh tay (pinch-to-resize) | Human-in-the-loop bù đắp sai số |

---

### 10.8. Data Requirements / Data Source (AI-Specific #2)

| Nguồn dữ liệu | Mục đích | Chủ sở hữu | Cập nhật |
|---|---|---|---|
| **3D Furniture Catalog** | Metadata cho ~75 mô hình 3D (tên, phong cách, kích thước thật, giá tham khảo, link mua, file .glb/.gltf) | YourSpace curate từ Sketchfab/CGTrader + đối tác tương lai | Founder thêm thủ công trong MVP |
| **Depth Estimation Model** | Model weights cho Depth Anything V2 Small (~25MB), bundle cùng app | Open-source (MIT license) | Cập nhật khi có version mới cải thiện accuracy |
| **Style Knowledge Base** | Mô tả chi tiết 5 phong cách nội thất (đặc trưng, palette, chất liệu). Dùng cho UI hiển thị, không cho AI | YourSpace tự biên soạn | Founder cập nhật khi thêm phong cách mới |
| **User Interaction Logs** | Phong cách nào được chọn, đồ nào hay kéo vào, đồ nào hay bị xóa, tần suất override AI scale → training data tương lai | YourSpace (auto-collected) | Real-time logging |
| **Ảnh phòng user upload** | Ảnh 2D làm background + input cho depth estimation | User sở hữu | Xử lý on-device, không upload lên server trong MVP — tránh vấn đề privacy |

**Lưu ý quan trọng về dữ liệu:**
- AI trong MVP chạy **hoàn toàn on-device** (depth estimation + inpainting) → không cần server AI, không có chi phí API per-request.
- **Không dùng RAG, không fine-tune** ở giai đoạn MVP.
- Chiến lược dài hạn: Tích lũy interaction logs (đồ nào user hay override scale?) → cải thiện heuristic đặt đồ + data cho Style Quiz AI ở phase sau.

---

### 10.9. Fallback UX (AI-Specific #3)

> *"Hãy tưởng tượng AI bị ngáo — bạn sẽ thiết kế gì cho người dùng?"*

#### Nguyên tắc thiết kế Fallback:

1. **Quản trị kỳ vọng** — Cảnh báo trước, không hứa hẹn quá mức.
2. **Human-in-the-loop** — User luôn chốt quyết định cuối cùng.
3. **Handover mượt mà** — Khi AI fail, user không bị "kẹt" mà có đường đi tiếp.

#### Kịch bản Fallback cụ thể:

| # | Tình huống AI fail | Trigger | Hành động hệ thống | UI cho người dùng |
|---|---|---|---|---|
| **F1** | **AI scale đồ sai tỉ lệ** (to/nhỏ quá so với phòng) | User pinch-to-resize ngay sau khi đặt đồ, HOẶC kích thước đồ chênh > 30% so với tỉ lệ kỳ vọng từ depth map | Ghi log `scale_override`, cho phép chỉnh tay tự do | Hiển thị handle resize rõ ràng + tooltip: *"Kéo để chỉnh kích thước cho vừa ý bạn"* |
| **F2** | **AI đặt đồ sai vị trí depth** (đồ lơ lửng, không chạm sàn) | Depth map có confidence thấp tại vùng user thả đồ, HOẶC user di chuyển đồ ngay sau khi thả | Snap đồ xuống "đường sàn" ước lượng gần nhất, cho phép user drag tự do | Hiển thị grid/guideline mờ trên ảnh giúp user căn vị trí. Tooltip: *"Giữ và kéo để đặt đúng chỗ"* |
| **F3** | **Xóa đồ nhưng inpainting xấu** (vùng xóa bị nhòe, artifact) | User xóa item và vùng phía sau bị lỗi thị giác rõ rệt | Fallback: hiển thị lại pixel gốc từ ảnh ban đầu (không dùng inpainting AI) | Tự động reveal ảnh gốc. Nếu user đã đặt nhiều đồ chồng lên → hiện nút *"Khôi phục ảnh gốc"* để reset vùng đó |
| **F4** | **Ảnh upload chất lượng kém** (mờ, góc lạ, quá tối) | Depth estimation trả về confidence < 0.4 trên > 50% diện tích ảnh | Không block user — vẫn cho sử dụng nhưng tắt auto-scale, chuyển sang manual mode | Hiển thị: *"Ảnh hơi khó phân tích — bạn sẽ tự chỉnh kích thước đồ nhé. Mẹo: chụp thẳng, đủ sáng, thấy rõ sàn nhà."* + Nút [Chụp lại] |
| **F5** | **Thiết bị quá yếu** (không chạy được depth model on-device) | GPU không hỗ trợ hoặc inference > 15 giây | Tắt hoàn toàn AI depth, chuyển sang pure manual mode (user tự resize tất cả) | Hiển thị: *"Thiết bị của bạn chưa hỗ trợ đặt đồ tự động — bạn có thể tự chỉnh kích thước bằng tay."* Trải nghiệm core (kéo thả, xoay, xóa) vẫn hoạt động 100% |
| **F6** | **User muốn undo thao tác** | User nhấn nút Undo hoặc shake device | Hoàn tác hành động gần nhất (thêm/xóa/di chuyển/resize) | Nút Undo luôn hiển thị. Hỗ trợ multi-undo (≥ 10 bước) |

#### Nguyên tắc bất di bất dịch:

> 🔒 **AI KHÔNG BAO GIỜ tự động thay đổi dữ liệu của user.** AI chỉ đóng vai trò **hỗ trợ** (assist), user là người **chốt** (decide). Cụ thể:
> - AI **gợi ý** scale/vị trí khi thả đồ, nhưng user **luôn có thể override** bằng pinch/drag.
> - AI **KHÔNG** tự động xóa, thêm, hoặc thay đổi đồ mà user đã đặt.
> - AI **KHÔNG** tự động di chuyển layout khi user thêm đồ mới.
> - Khi AI không chắc chắn (low confidence), **chuyển sang manual mode** thay vì đoán bừa.
>
> Mọi hành động thay đổi canvas đều phải có thao tác chủ động từ user (drag, tap, pinch, confirm).

---

### 10.10. Clarity Review Gate

Kiểm tra cuối cùng để đảm bảo PRD đủ rõ ràng:

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| User Stories mô tả **hành vi**, không mô tả giao diện UI? | ✅ | Các story mô tả "tôi muốn kéo thả đồ", "AI tự động scale" (hành vi), không mô tả UI cụ thể |
| Fallback UX chỉ rõ **trigger** và **hành động cụ thể**? | ✅ | 6 kịch bản bao phủ: scale sai, depth sai, inpainting lỗi, ảnh kém, device yếu, undo — mỗi cái có trigger + action rõ ràng |
| Model Selection có **lý do cụ thể**, không chỉ ghi tên model? | ✅ | Giải thích tại sao on-device (Depth Anything V2), tại sao không cloud API, tại sao không ARKit full, trade-off sai số chấp nhận được |
| Data Source có **tên nguồn thực tế**? | ✅ | Depth Anything V2 (MIT), Sketchfab/CGTrader cho 3D, LaMa cho inpainting |
| **Kill question:** Engineer đọc User Story + Fallback UX, cần hỏi lại > 3 câu? | ✅ Không | Acceptance criteria có số cụ thể (≤ 5s depth, ≥ 30fps, ±15-20% sai số), Fallback có bảng trigger-action cho cả 6 tình huống |

---

## 11. Workshop 3: Hypothesis & PMF Scorecard

> **Mục tiêu:** Đo lường sự thành công bằng con số, không bằng cảm giác. Mọi tính năng trong PRD đều là một "vụ cá cược" (bet) — workshop này giúp xác định cá cược nào nguy hiểm nhất và cách kiểm chứng nó. *(Tầng 6: Test with Customers)*

---

### 11.1. Bước 1 — RAT (Riskiest Assumption Test)

**Câu hỏi dẫn đường:** *Giả định nào, nếu sai, sẽ khiến toàn bộ dự án sụp đổ — bất kể UX có đẹp đến đâu hay AI có chính xác đến mấy?*

#### Giả định nguy hiểm nhất:

> **"Người dùng sẽ coi trải nghiệm 'sống thử phong cách' trên YourSpace là bước đệm để MUA SẮM THẬT, chứ không phải chỉ là một trò chơi trang trí miễn phí (giống The Sims)."**

#### Phân tích chuỗi hậu quả nếu RAT sai:

```
User chỉ "chơi" kéo thả cho vui, không click mua
        ↓
Click-to-Buy Rate ≈ 0% → Không tạo ra doanh thu affiliate
        ↓
Nhà cung cấp nội thất (Providers) không thấy ROI
        ↓
Providers hủy hợp đồng, rút catalog 3D khỏi nền tảng
        ↓
Catalog trống → User có nhu cầu mua thật không có gì để mua
        ↓
Churn toàn bộ → Mô hình nền tảng sụp đổ
```

**Tại sao đây là giả định nguy hiểm nhất (không phải giả định khác)?**

| Giả định | Mức độ rủi ro | Lý do không phải RAT |
|---|---|---|
| "AI depth estimation đủ chính xác" | Trung bình | Nếu sai → user vẫn chỉnh tay được (Human-in-the-loop). Sản phẩm vẫn hoạt động. |
| "User sẽ upload ảnh phòng thật" | Trung bình | Nếu user ngại upload → có thể cung cấp ảnh phòng mẫu để thử trước. Giải pháp đơn giản. |
| "Catalog 3D đủ đẹp và đa dạng" | Cao, nhưng sửa được | Nếu thiếu → curate thêm từ Sketchfab/CGTrader. Tốn thời gian nhưng không phá mô hình. |
| **"User sẽ mua sau khi thử"** | **CỰC CAO — phá mô hình** | **Nếu sai → KHÔNG CÓ giải pháp kỹ thuật nào cứu được.** Phải pivot toàn bộ value proposition hoặc business model. |

---

### 11.2. Bước 2 — Thiết lập Giả thuyết (Hypothesis)

#### Giả thuyết chính (Primary Hypothesis):

> "Chúng tôi tin rằng **[tính năng panel dự toán chi phí riêng biệt (tách khỏi canvas phối cảnh) — hiển thị tổng chi phí + danh sách đồ kèm nút "Xem chi tiết / Mua" khi user vuốt lên hoặc chuyển sang tab Dự toán]** sẽ giúp **[Young Aesthetes 25–35 tuổi đang trang trí nhà đầu tiên]** đạt được **[chuyển hóa từ hành vi "khám phá/chơi thử" sang hành vi ra quyết định mua sắm thực tế, mà KHÔNG phá vỡ trải nghiệm thẩm mỹ trên canvas]**.
> 
> Chúng tôi sẽ biết mình đúng khi thấy **[Click-to-Buy Rate]** đạt **[≥ 15% trong số user đã hoàn thành ≥ 1 bản phối (đặt ≥ 3 đồ vật vào phòng)]** trong **4 tuần đầu** sau khi ra mắt Prototype."

#### Giả thuyết phụ (Secondary Hypothesis):

> "Chúng tôi tin rằng **[AI Spatial Placement — tự động scale đồ khớp depth/phối cảnh phòng]** sẽ giúp **[Young Aesthetes]** đạt được **[cảm giác "thật" khi ướm thử, đủ tin tưởng để ra quyết định mua]**.
>
> Chúng tôi sẽ biết mình đúng khi thấy **[AI Placement Accuracy — % đồ user KHÔNG cần chỉnh lại sau khi thả]** đạt **[≥ 60%]** và **[Time-to-Value (thời gian từ mở app → đặt đồ đầu tiên)]** đạt **[≤ 3 phút]**."

---

### 11.3. Bước 3 — Aha Moment (Khoảnh khắc nhận ra giá trị)

#### Aha Moment được định nghĩa:

> **Khoảnh khắc user đặt xong món đồ thứ 3 vào ảnh phòng thật, nhìn thấy tổng dự toán chi phí nằm trong ngân sách, và quyết định hành động — nhấn "Xem chi tiết / Mua" hoặc "Tôi muốn tư vấn" để chuyển sang bước hiện thực hóa.**

> **→ Thêm 1 nút CTA phụ "Tôi muốn tư vấn"** bên cạnh nút "Mua" — khi nhấn chỉ thu thập SĐT/Zalo rồi gửi lead cho đội offline. Không cần build chat in-app, nhưng vẫn đo được signal "intent liên hệ tư vấn".

#### Chỉ số hành động (Actionable Metric) cho Aha Moment:

| Metric | Cách đo | Tại sao KHÔNG phải Vanity Metric |
|---|---|---|
| **Aha Conversion Rate** | % user đặt ≥ 3 đồ vào phòng VÀ click ≥ 1 outbound link (Mua/Tư vấn) trong cùng phiên | Đo hành vi có ý định mua, không đo lượt tải hay lượt kéo thả |
| **Repeat Design Rate** | % user tạo bản phối thứ 2 trong vòng 7 ngày | Chứng tỏ user quay lại vì giá trị thật, không phải tò mò lần đầu |
| **Save-then-Return Rate** | % bản phối được lưu mà sau đó user quay lại xem trong vòng 7 ngày | Đo "intent to buy có suy nghĩ" — user lưu → suy nghĩ → quay lại (hành vi mua nội thất cổ điển) |

#### Bẫy Vanity Metric cần tránh:

| ❌ Vanity Metric | Tại sao là bẫy |
|---|---|
| Tổng lượt tải app | Tải xong rồi bỏ = 0 giá trị |
| Tổng số đồ 3D được kéo thả | Kéo thả nhiều = đang chơi game xếp hình, không = muốn mua |
| Thời gian trung bình trong app | Dùng lâu có thể vì UX rối, không phải vì thích sản phẩm |
| Số bản phối được tạo (không kèm click Mua) | Tạo 10 bản nhưng không click Mua lần nào = giải trí thuần túy |

---

### 11.4. Bước 4 — Tín hiệu PMF (PMF Signal)

Nội thất là mua sắm **tần suất thấp** (Low Frequency) — người ta không mua sofa mỗi tuần. Do đó, DAU/WAU không phù hợp làm tín hiệu PMF. Thay vào đó:

#### PMF Signal chính:

| Thước đo | Cách thực hiện | Ngưỡng PMF |
|---|---|---|
| **Sean Ellis Test** | Khảo sát user đã click Mua ≥ 1 lần: *"Bạn sẽ cảm thấy thế nào nếu không thể dùng YourSpace nữa?"* | **≥ 40%** trả lời "Rất thất vọng" |
| **Click-to-Buy Rate** | % user hoàn thành bản phối → click outbound link mua hàng | **≥ 15%** duy trì trong 4 tuần liên tục |
| **Organic Referral Rate** | % user mới đến từ giới thiệu (không qua paid ads) — đo bằng referral code hoặc survey "Bạn biết YourSpace từ đâu?" | **≥ 25%** user mới từ giới thiệu |

#### PMF Signal phụ (Early Warning — tín hiệu sớm):

| Signal | Ý nghĩa |
|---|---|
| User tự chụp ảnh phòng THẬT (không dùng ảnh mẫu) | Intent thật — đang nghiêm túc trang trí phòng mình |
| User lưu bản phối VÀ quay lại xem lại sau ≥ 24 giờ | "Về nhà suy nghĩ" — tín hiệu mua nội thất cổ điển |
| User nhấn "Tôi muốn tư vấn" và để lại SĐT | Cam kết cao nhất — sẵn sàng nói chuyện với người thật |
| User chia sẻ bản phối cho người thân (screenshot/link) | Đang "hỏi ý kiến gia đình" — bước cuối trước khi mua |

---

## 12. Stress-Test bằng AI (AI as a Challenger)

> *Vai trò: **Lead PM tàn nhẫn + Senior AI Engineer hoài nghi.***  
> *Nhiệm vụ: Tìm và phơi bày mọi lỗ hổng. Không khuyến khích. Chỉ tấn công.*
> *Đầu vào: Toàn bộ Workshop 1 (MVP Boundary), Workshop 2 (PRD Skeleton), Workshop 3 (Hypothesis & PMF).*

---

#### 🚨 1. SCOPE CREEP — "In-Scope" nào thực ra là "Nice-to-have"?

| # | Tính năng In-Scope bị nghi ngờ | Phán quyết | Lập luận |
|---|---|---|---|
| **S1** | **AI Spatial Placement (Depth Estimation on-device)** | ⚠️ **MUST-HAVE có rủi ro kỹ thuật cao** | Quyết định sản phẩm hiện tại: AI Spatial Placement là MVP vì nó tạo cảm giác "thật" và giảm ma sát scale thủ công. Rủi ro không nằm ở việc có làm hay không, mà ở mức tự động hóa đến đâu. MVP phải giới hạn scope: AI chỉ gợi ý scale/vị trí ban đầu, user luôn override được, và nếu confidence thấp thì chuyển sang manual mode. |
| **S2** | **Inpainting khi xóa đồ (dù là fallback reveal ảnh gốc)** | ✅ OK nếu chỉ reveal ảnh gốc | Nhưng PRD (mục 10.7) vẫn list LaMa như một lựa chọn. Bạn cần **xóa hẳn LaMa khỏi scope MVP** chứ không phải ghi "hoặc fallback". Mập mờ = scope creep. |
| **S3** | **5 phong cách × 15 sản phẩm = 75 models 3D** | ⚠️ **Quá nhiều cho MVP** | Bạn cần 75 mô hình 3D chất lượng, curate thủ công, gắn metadata (tên, giá, link, phong cách, kích thước thật). Solo founder làm 75 cái = 2–3 tuần chỉ riêng việc curate. **Giảm xuống: 2 phong cách × 8 sản phẩm = 16 models.** Đủ để test giả thuyết. Nếu 16 models mà user vẫn click Mua → validate rồi, thêm sau. |
| **S4** | **Xoay item 360° (User Story #4 Acceptance Criteria)** | ⚠️ **Giảm scope** | Giữ xoay cơ bản để user căn hướng đồ, nhưng không biến nó thành tính năng 3D editor phức tạp. Mục tiêu MVP là đủ thật để ướm thử và click mua, không phải thay thế phần mềm thiết kế. |
| **S5** | **Nút "Tôi muốn tư vấn" + thu thập SĐT/Zalo** | ⚠️ **Scope creep từ Workshop 3** | Tính năng này không có trong PRD ban đầu (Mục 9–10), nhưng Workshop 3 tự thêm vào. Nó tạo ra nghĩa vụ: ai nhận lead? Ai gọi lại? Bạn là solo founder — **bạn sẽ tự gọi điện tư vấn nội thất cho user?** Nếu không có đội offline nhận lead, nút này tạo kỳ vọng rồi gây thất vọng (user để SĐT nhưng không ai gọi lại). **Chỉ giữ nếu bạn cam kết tự gọi lại trong 24h. Nếu không → cắt.** |

---

#### 🤖 2. AI FALLBACK HOLES — Edge cases chưa lường trước

| # | Edge Case | Scenario cụ thể | Tại sao Fallback UX hiện tại KHÔNG cover | Đề xuất |
|---|---|---|---|---|
| **H1** | **Occlusion (che khuất)** | User chụp phòng có bàn thật. Thả ghế 3D "phía sau" bàn → ghế render NỔI LÊN TRÊN bàn. | Fallback UX (F1–F6) không có kịch bản nào xử lý occlusion. Không có trigger, không có UI response. | Onboarding: "Chụp góc phòng trống". Cho user sắp xếp layer (trước/sau) thủ công. |
| **H2** | **Bóng đổ xung đột** | Ảnh ánh sáng từ cửa sổ bên trái. Model 3D bóng từ trên xuống. Hai hướng bóng → phá ảo giác. | Không có trong Fallback. | MVP: tắt bóng đổ hoàn toàn (ambient only). |
| **H3** | **Depth map sai ở vùng gương/kính** | Phòng có gương lớn hoặc cửa kính → depth estimation hiểu reflection là "phòng thứ 2" phía sau → depth map sai hoàn toàn tại vùng đó → item 3D bị scale kỳ quái. | Fallback F4 chỉ cover "ảnh mờ/tối", không cover reflective surfaces — vốn rất phổ biến trong phòng ngủ/phòng khách Việt Nam. | Thêm cảnh báo: "Tránh chụp thẳng vào gương hoặc cửa kính." Hoặc: tự detect vùng depth bất thường (giá trị depth đột ngột nhảy vọt) → đánh dấu là "vùng không tin cậy" → manual mode tại vùng đó. |
| **H4** | **User chụp ảnh phòng ban đêm (thiếu sáng)** | Depth Anything V2 hoạt động kém trên ảnh thiếu sáng (noise cao, contrast thấp). User Việt Nam hay chụp ảnh phòng buổi tối sau giờ làm. | F4 cover "ảnh quá tối" nhưng trigger là "confidence < 0.4 trên > 50% diện tích". Vấn đề: depth model **vẫn có thể trả confidence cao trên ảnh tối** vì model không biết nó đang sai — nó confident nhưng wrong. Trigger dựa vào confidence score là không đủ. | Thêm pre-check trước khi chạy depth: đo brightness trung bình của ảnh. Nếu < threshold → cảnh báo ngay: "Ảnh hơi tối, bật đèn rồi chụp lại nhé!" |
| **H5** | **Cùng 1 ảnh, 2 lần upload → 2 depth map khác nhau** | Depth Anything V2 là deterministic trên cùng input, nhưng nếu user crop ảnh khác nhau hoặc app resize ảnh trước khi feed vào model (do khác tỉ lệ màn hình) → depth map khác → đồ đã đặt bị nhảy scale khi mở lại. | Fallback không cover "inconsistency giữa các session". User đặt 5 đồ, lưu, mở lại → tất cả bị scale sai vì depth map mới khác cũ. | Cache depth map theo ảnh gốc (hash). Khi mở lại bản phối → dùng depth map đã cache, không tính lại. |
| **H6** | **3D model kích thước metadata sai** | Bạn curate model từ Sketchfab — nhưng nhiều model trên đó không có kích thước thật (real-world dimensions). Một cái sofa có thể được model ở scale 1:1 hoặc 1:100. AI auto-scale dựa vào depth + kích thước thật của đồ → nếu metadata sai → scale sai toàn bộ, AI bị "đổ tội oan". | Fallback F1 cover "scale sai" nhưng giả định nguyên nhân là depth estimation sai. Thực tế nguyên nhân có thể là **data catalog bẩn**. Bạn không có validation pipeline cho 3D metadata. | Tạo checklist QA cho mỗi model 3D trước khi thêm vào catalog: verify kích thước thật (cm), verify origin point, verify up-axis. Nếu không pass → không deploy. |

---

#### 📊 3. VANITY METRIC TRAP — Aha Moment có thật sự Actionable?

**Aha Moment hiện tại:** *"User đặt ≥ 3 đồ + thấy tổng chi phí hợp ngân sách + click Mua/Tư vấn."*

**Phê bình:**

| Vấn đề | Chi tiết |
|---|---|
| **"≥ 3 đồ" là ngưỡng tùy tiện** | Tại sao 3 chứ không phải 1 hay 5? Bạn không có dữ liệu nào chứng minh 3 là điểm bùng phát (inflection point). Nếu user đặt 1 cái sofa ưng ý và click Mua ngay → đó cũng là Aha Moment. Ngưỡng 3 có thể khiến bạn bỏ sót những user có intent mua cao nhất (người biết chính xác mình cần gì, chỉ cần 1 item). **Đề xuất: Bỏ ngưỡng số lượng đồ. Aha = "User click outbound link Mua/Tư vấn ≥ 1 lần trong phiên có upload ảnh phòng THẬT."** |
| **"Thấy tổng chi phí hợp ngân sách" — bạn không đo được** | Bạn không hỏi ngân sách user. Bạn không biết "hợp" hay "không hợp". Đây là giả định nằm trong định nghĩa Aha Moment nhưng hoàn toàn không đo được. **Đề xuất: Bỏ điều kiện này. Chỉ đo hành vi (click Mua), không đoán tâm lý (hợp ngân sách).** |
| **Click-to-Buy vẫn có thể là Vanity** | User click "Xem chi tiết" ra Shopee vì **tò mò giá thật** (so với giá tham khảo trên app), không phải vì muốn mua. Đặc biệt nếu giá trên app là "khoảng giá" (ví dụ: 5–8 triệu) → user click ra để xem giá chính xác. Đó là click tò mò, không phải click mua. **Đề xuất: Đo "Click-to-Buy → Dwell time ≥ 30s trên site đối tác" bằng UTM + redirect tracking. Nếu user bounce trong < 10s → không tính là Aha.** |

**Metric thay thế tốt hơn (Leading Indicator):**

> **"% user upload ảnh phòng THẬT (không dùng ảnh mẫu) VÀ click outbound link Mua ≥ 1 lần trong cùng session."**
> 
> Tại sao tốt hơn: Upload ảnh thật = intent thật (đang nghiêm túc trang trí phòng MÌNH). Kết hợp với click Mua = hành vi chuyển đổi rõ ràng. Không phụ thuộc vào ngưỡng số đồ hay giả định về ngân sách.

---

#### 💀 4. HYPOTHESIS WEAKNESS — Giả thuyết nào yếu nhất?

**Giả thuyết yếu nhất: Giả thuyết phụ (Secondary Hypothesis) về AI Spatial Placement.**

| Điểm yếu | Phân tích |
|---|---|
| **Không có baseline để so sánh** | Bạn đặt target "AI Placement Accuracy ≥ 60%". Nhưng bạn chưa từng chạy Depth Anything V2 trên ảnh phòng Việt Nam (thường nhỏ, nhiều đồ, ánh sáng yếu). Bạn không biết baseline hiện tại là bao nhiêu. Có thể nó chỉ đạt 30% trên ảnh phòng thật của target user. **Bạn đang đặt target mà không biết điểm xuất phát.** |
| **Cách invalidate dễ nhất** | Chụp 20 ảnh phòng thật (phòng trọ, chung cư, nhà phố ở HCM/HN) → chạy Depth Anything V2 → đo xem depth map có hợp lý không. Nếu > 50% ảnh cho depth map tệ → **giả thuyết phụ sụp ngay trước khi code 1 dòng.** Đây là experiment có thể làm trong 1 ngày mà bạn chưa làm. |
| **Quan hệ nhân quả chưa chứng minh** | Bạn giả định: AI scale chính xác → user cảm thấy "thật" → user mua. Nhưng có thể user cảm thấy "thật" đơn giản vì ảnh phòng là phòng họ, đồ 3D trông đẹp, và bảng giá hợp lý — **bất kể AI có auto-scale hay không**. Bạn đang gán công cho AI mà chưa kiểm tra liệu manual resize có cho kết quả tương đương không. |
| **Conflict với RAT** | RAT nói: "Rủi ro lớn nhất là user không mua." Hypothesis phụ nói: "AI chính xác sẽ khiến user mua." Nhưng nếu RAT đúng (user chỉ chơi game), thì dù AI có accuracy 100%, user vẫn không mua. **AI accuracy là necessary condition, không phải sufficient condition.** Giả thuyết phụ không thể đứng độc lập — nó phụ thuộc vào giả thuyết chính đúng trước đã. |

**Cách invalidate nhanh nhất (1 tuần, zero code):**

1. Tạo 5 ảnh phòng + ghép thủ công (Photoshop/Canva) đồ nội thất vào — 1 bản "ghép vụng" (sai scale) và 1 bản "ghép đẹp" (đúng scale).
2. Cho 20 người thuộc target segment xem cả 2 bản.
3. Hỏi: "Bạn có click Mua không? Bản nào khiến bạn muốn mua hơn?"
4. Nếu kết quả: không ai muốn mua dù bản "ghép đẹp" → **RAT sai, dừng dự án.**
5. Nếu kết quả: bản "ghép đẹp/đúng scale" tạo purchase intent cao hơn đáng kể → **AI Spatial Placement được giữ là MVP**, nhưng cần đo baseline depth accuracy và thiết kế manual fallback trước khi launch.

---

### 12.5. Tổng kết & Action Items từ Stress-Test

| # | Action | Loại | Mức ưu tiên | Khi nào |
|---|---|---|---|---|
| 1 | **Chạy experiment Photoshop** (5 ảnh × 2 bản × 20 người) để test RAT + giá trị AI trước khi code | Validation | 🔴 P0 | Tuần 1, TRƯỚC khi code |
| 2 | **Chạy Depth Anything V2 trên 20 ảnh phòng VN thật** để xác định baseline accuracy | Validation | 🔴 P0 | Tuần 1 |
| 3 | Cắt xoay 360° khỏi MVP Acceptance Criteria — chỉ giữ xoay trục Y | Scope | 🟡 P1 | Cập nhật PRD |
| 4 | Giảm catalog từ 75 models → 16 models (2 phong cách × 8 sản phẩm) | Scope | 🟡 P1 | Cập nhật PRD |
| 5 | Xóa hẳn LaMa khỏi PRD — MVP chỉ dùng reveal ảnh gốc khi xóa item 3D | Scope | 🟡 P1 | Cập nhật PRD |
| 6 | Tạo QA checklist cho 3D model metadata (kích thước thật, origin, up-axis) | Data | 🟡 P1 | Trước khi import model |
| 7 | Thêm pre-check brightness cho ảnh upload (trước khi chạy depth estimation) | AI Fallback | 🟡 P1 | Trong dev |
| 8 | Cache depth map theo hash ảnh gốc — không tính lại khi mở bản phối cũ | AI Fallback | 🟡 P1 | Trong dev |
| 9 | Setup UTM tracking + redirect dwell-time measurement cho outbound links | Metric | 🟡 P1 | Trước launch |
| 10 | Sửa Aha Moment: bỏ ngưỡng "≥ 3 đồ", bỏ "hợp ngân sách" → đo "upload ảnh thật + click Mua" | Metric | 🟡 P1 | Cập nhật PRD |
| 11 | Quyết định có giữ nút "Tôi muốn tư vấn" hay không — nếu giữ, cam kết tự gọi lại trong 24h | Scope | 🟢 P2 | Trước launch |
