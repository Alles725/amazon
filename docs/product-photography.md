# Product photography

## Audit — 2026-10-01

The current catalog contains 150 products (146 demo records and four original
seed records). Eight originally had no photograph and the expanded catalog added
97 SVG illustrations. All 150 now resolve to distinct local photographs. The
casual shoe p19 also has a different photo from both p5 and p32.

| Product / SKU | Previous state | Local image |
| --- | --- | --- |
| 65W USB-C Charger / ELEC-0001 | No media metadata | usb-c-charger.png |
| Quiet Wireless Mouse / ELEC-0002 | No media metadata | silent-mouse.png |
| Designing Data-Intensive Systems / BOOK-0001 | No media metadata | data-intensive-book.png |
| Pour-Over Coffee Kettle / HOME-0001 | No media metadata | gooseneck-kettle.jpg |
| Câmera de Segurança Wi-Fi Full HD / DEMO-p12 | Generic camera glyph | security-camera.jpg |
| Luminária de Mesa LED Regulável / DEMO-p14 | Generic lamp glyph | desk-lamp.png |
| Garrafa Térmica Inox 1L / DEMO-p15 | Generic bottle glyph | thermal-bottle.jpg |
| Kit 3 Livros Best-sellers de Ficção / DEMO-p20 | Generic book glyph | fiction-box.jpg |
| Tênis Casual Unissex Leve / DEMO-p19 | Same photo as p5 sports shoe | catalog/casual-slip-on.jpg |

## Data and rendering

Database/API have no image field. Catalog data, stock, prices, names, descriptions,
ratings and seed logic are unchanged. Existing demo media lives in
`config/demo-products.json`; `config/product-images.json` adds media-only entries
for the four original seed products. Both resolve by SKU **and** slug to avoid
accidental matches for unrelated records. No ID-specific page/template is added.

`productPresentation` supplies photos to shared cards, cart and checkout.
`config/demo-product-content.json` supplies the detail galleries; all 97 SVG
gallery entries were updated together with the corresponding card photos. Homepage collections consume the same demo fixtures. Files live in
`apps/storefront/public/images/products`; attribution and original URLs are in
[SOURCES.md](../apps/storefront/public/images/products/SOURCES.md).

These are representative photographs for the academic generic/fictitious listings,
not assertions that those listings are the exact branded models. BOOK-0001 retains
its existing title and uses the related Designing Data-Intensive Applications cover.
No new remotely fetched images are required in the customer's browser.

`ProductImage` now handles load errors with its neutral fallback. A changed image
source can load again. The gallery retains its existing error handling. Existing
image boxes and `object-fit: contain` rules are unchanged.

New products still require curated photo metadata in these registries while the
API has no media model. Keep the fallback for unknown/failing media. Existing search, category and brand listings reuse the same presentation.
`config/legacy-product-images.json` maps exact retired SVG URLs to photographs
when reading device-local browsing history, preserving IDs, dates and names.

## Verification

Asset coverage includes every current demo/seed image and every detail gallery.
Regression tests verify strict SKU/slug matching, image failure recovery and
migration of old browsing-history media without changing the saved visit.

Validation results are recorded in docs/ai/development-log.md.

## Expanded catalog replacements

The following 97 products previously used SVG illustrations. Each now has a
local photograph, synchronized between its card and gallery. Source URLs are
listed in SOURCES.md above.

| Product | Name | Photo |
| --- | --- | --- |
| p24 | Tênis de Corrida Stride Aero 3 Masculino, Preto | `/images/products/catalog/stride-aero-3-preto.jpg` |
| p25 | Tênis de Corrida Stride Aero 3 Masculino, Branco | `/images/products/catalog/stride-aero-3-branco.jpg` |
| p26 | Tênis de Corrida Stride Aero 3 Masculino, Azul | `/images/products/catalog/stride-aero-3-azul.jpg` |
| p27 | Tênis de Corrida Stride Aero 3 Masculino, Vermelho | `/images/products/catalog/stride-aero-3-vermelho.jpg` |
| p28 | Tênis de Corrida Veloce Pulse Unissex, Cinza | `/images/products/catalog/veloce-pulse-cinza.jpg` |
| p29 | Tênis de Corrida Veloce Pulse Unissex, Verde | `/images/products/catalog/veloce-pulse-verde.jpg` |
| p30 | Tênis de Corrida Veloce Pulse Unissex, Azul | `/images/products/catalog/veloce-pulse-azul.jpg` |
| p31 | Tênis de Corrida Kinetik Marathon Carbon com Placa de Carbono | `/images/products/catalog/kinetik-marathon-carbon.jpg` |
| p34 | Tênis Casual Urbano Classic em Couro, Branco | `/images/products/catalog/urbano-classic-branco.jpg` |
| p35 | Tênis Casual Urbano Classic em Couro, Preto | `/images/products/catalog/urbano-classic-preto.jpg` |
| p36 | Tênis Casual Urbano Classic em Couro, Vermelho | `/images/products/catalog/urbano-classic-vermelho.jpg` |
| p37 | Tênis Kairo Canvas Low Unissex, Preto | `/images/products/catalog/kairo-canvas-low-preto.jpg` |
| p38 | Tênis Kairo Canvas Low Unissex, Branco | `/images/products/catalog/kairo-canvas-low-branco.jpg` |
| p39 | Tênis Kairo Canvas Low Unissex, Azul-marinho | `/images/products/catalog/kairo-canvas-low-azul-marinho.jpg` |
| p40 | Tênis de Treino Kinetik Force Cross para Academia, Preto | `/images/products/catalog/kinetik-force-cross-preto.jpg` |
| p41 | Tênis de Treino Kinetik Force Cross para Academia, Cinza | `/images/products/catalog/kinetik-force-cross-cinza.jpg` |
| p42 | Chinelo Slide Terrah Comfort Unissex, Preto | `/images/products/catalog/terrah-comfort-slide-preto.jpg` |
| p43 | Chinelo Slide Terrah Comfort Unissex, Branco | `/images/products/catalog/terrah-comfort-slide-branco.jpg` |
| p44 | Chinelo Slide Terrah Comfort Unissex, Azul | `/images/products/catalog/terrah-comfort-slide-azul.jpg` |
| p45 | Chinelo de Dedo Kairo Brasil | `/images/products/catalog/kairo-brasil.jpg` |
| p46 | Bota Coturno Urbano Adventure em Couro | `/images/products/catalog/urbano-coturno.jpg` |
| p47 | Fone de Ouvido Bluetooth Nimbus Wave 700 com Cancelamento de Ruído, Preto | `/images/products/catalog/nimbus-wave-700-preto.jpg` |
| p48 | Fone de Ouvido Bluetooth Nimbus Wave 700 com Cancelamento de Ruído, Branco | `/images/products/catalog/nimbus-wave-700-branco.jpg` |
| p49 | Fone de Ouvido Bluetooth Nimbus Wave 700 com Cancelamento de Ruído, Azul | `/images/products/catalog/nimbus-wave-700-azul.jpg` |
| p51 | Fone de Ouvido TWS Nimbus Buds 2 Bluetooth 5.3, Preto | `/images/products/catalog/nimbus-buds-2-preto.png` |
| p52 | Fone de Ouvido TWS Nimbus Buds 2 Bluetooth 5.3, Branco | `/images/products/catalog/nimbus-buds-2-branco.jpg` |
| p53 | Fone de Ouvido TWS Nimbus Buds 2 Bluetooth 5.3, Verde | `/images/products/catalog/nimbus-buds-2-verde.webp` |
| p55 | Headset Gamer Vortex H5 RGB Som Surround 7.1 USB, Preto | `/images/products/catalog/vortex-h5-preto.jpg` |
| p56 | Headset Gamer Vortex H5 RGB Som Surround 7.1 USB, Branco | `/images/products/catalog/vortex-h5-branco.jpg` |
| p57 | Headset Gamer Sem Fio Vortex H9 Wireless 2.4 GHz | `/images/products/catalog/vortex-h9.jpg` |
| p58 | Caixa de Som Bluetooth Sonora Boom Mini à Prova d'Água IP67, Preto | `/images/products/catalog/sonora-boom-mini-preto.jpg` |
| p59 | Caixa de Som Bluetooth Sonora Boom Mini à Prova d'Água IP67, Azul | `/images/products/catalog/sonora-boom-mini-azul.jpg` |
| p60 | Caixa de Som Bluetooth Sonora Boom Mini à Prova d'Água IP67, Vermelho | `/images/products/catalog/sonora-boom-mini-vermelho.jpg` |
| p62 | Echo Pop | Smart speaker compacto com Alexa, Preto | `/images/products/catalog/echo-pop-preto.jpg` |
| p63 | Echo Pop | Smart speaker compacto com Alexa, Branco | `/images/products/catalog/echo-pop-branco.jpg` |
| p64 | Echo Show 8 (3ª geração) | Tela inteligente HD de 8" com Alexa | `/images/products/catalog/echo-show-8.jpg` |
| p65 | Kindle Paperwhite 16 GB | Tela de 7" e bateria de até 12 semanas | `/images/products/catalog/kindle-paperwhite.jpg` |
| p66 | Fire TV Stick 4K | Streaming em 4K com Wi-Fi 6 e controle remoto por voz | `/images/products/catalog/fire-tv-stick-4k.jpg` |
| p67 | Smartwatch Kairo Fit 3 com GPS e Monitor de Oxigenação, Preto | `/images/products/catalog/kairo-fit-3-preto.jpg` |
| p68 | Smartwatch Kairo Fit 3 com GPS e Monitor de Oxigenação, Cinza | `/images/products/catalog/kairo-fit-3-cinza.jpg` |
| p69 | Smartwatch Kairo Fit 3 com GPS e Monitor de Oxigenação, Azul | `/images/products/catalog/kairo-fit-3-azul.jpg` |
| p70 | Carregador Turbo USB-C Voltra 30W GaN, Branco | `/images/products/catalog/voltra-gan-30w-branco.jpg` |
| p71 | Carregador Turbo USB-C Voltra 30W GaN, Preto | `/images/products/catalog/voltra-gan-30w-preto.jpg` |
| p73 | Cabo USB-C para USB-C Voltra em Nylon Trançado 2 m 100W, Preto | `/images/products/catalog/voltra-cabo-usbc-preto.jpg` |
| p74 | Cabo USB-C para USB-C Voltra em Nylon Trançado 2 m 100W, Vermelho | `/images/products/catalog/voltra-cabo-usbc-vermelho.jpg` |
| p75 | Carregador Portátil Voltra 10000 mAh com USB-C PD 20W | `/images/products/catalog/voltra-10000.jpg` |
| p77 | Controle Sem Fio Vortex Pro para PC e Android com Gatilhos Hall | `/images/products/catalog/vortex-pro-pad.jpg` |
| p78 | Controle Bluetooth Arcadia Retro Pad para PC, Android e Switch | `/images/products/catalog/arcadia-retro-pad.png` |
| p82 | Teclado Mecânico Gamer Vortex K60 TKL RGB Switch Red ABNT2, Preto | `/images/products/catalog/vortex-k60-preto.png` |
| p83 | Teclado Mecânico Gamer Vortex K60 TKL RGB Switch Red ABNT2, Branco | `/images/products/catalog/vortex-k60-branco.webp` |
| p84 | Teclado Sem Fio Orion Slim Multi-dispositivo Bluetooth ABNT2 | `/images/products/catalog/orion-slim-keys.jpg` |
| p85 | Mouse Gamer Vortex M7 RGB 16.000 DPI 7 Botões, Preto | `/images/products/catalog/vortex-m7-preto.jpg` |
| p86 | Mouse Gamer Vortex M7 RGB 16.000 DPI 7 Botões, Branco | `/images/products/catalog/vortex-m7-branco.jpg` |
| p87 | Mouse Sem Fio Orion Silent Click 1600 DPI, Cinza | `/images/products/catalog/orion-silent-cinza.png` |
| p88 | Mouse Sem Fio Orion Silent Click 1600 DPI, Azul | `/images/products/catalog/orion-silent-azul.jpg` |
| p89 | Webcam Lumio View Full HD 1080p com Microfone Duplo | `/images/products/catalog/lumio-view-1080.jpg` |
| p90 | Monitor Orion 24" IPS Full HD 75 Hz com HDMI | `/images/products/catalog/orion-24-ips.jpg` |
| p91 | Monitor Gamer Vortex 27" QHD 165 Hz 1 ms | `/images/products/catalog/vortex-27-qhd.png` |
| p92 | Mousepad Gamer Vortex Speed XL 90 x 40 cm com Borda Costurada | `/images/products/catalog/vortex-speed-xl.jpg` |
| p93 | SSD Nexa 1TB M.2 NVMe PCIe 4.0 Leitura de até 7.000 MB/s | `/images/products/catalog/nexa-nvme-1tb.jpg` |
| p94 | Memória RAM Nexa 16GB DDR4 3200 MHz para Desktop | `/images/products/catalog/nexa-ddr4-16.png` |
| p95 | Hub USB-C Voltra 7 em 1 com HDMI 4K, USB 3.0 e Leitor SD | `/images/products/catalog/voltra-hub-7em1.jpg` |
| p96 | Suporte para Notebook Orion em Alumínio com Ajuste de Altura | `/images/products/catalog/orion-stand-alu.jpg` |
| p97 | Mochila Executiva Orion Urban para Notebook 15,6" com Porta USB, Preto | `/images/products/catalog/orion-urban-pack-preto.jpg` |
| p98 | Mochila Executiva Orion Urban para Notebook 15,6" com Porta USB, Cinza | `/images/products/catalog/orion-urban-pack-cinza.jpg` |
| p99 | Mochila Executiva Orion Urban para Notebook 15,6" com Porta USB, Azul | `/images/products/catalog/orion-urban-pack-azul.webp` |
| p100 | Cafeteira Elétrica Brava Aroma 30 Xícaras com Jarra de Vidro, Preto | `/images/products/catalog/brava-aroma-30-preto.jpg` |
| p101 | Cafeteira Elétrica Brava Aroma 30 Xícaras com Jarra de Vidro, Vermelho | `/images/products/catalog/brava-aroma-30-vermelho.jpg` |
| p102 | Cafeteira Expresso Brava Barista 15 Bar com Vaporizador | `/images/products/catalog/brava-barista.jpg` |
| p103 | Liquidificador Brava Power 900W Copo de Vidro 2L 12 Velocidades | `/images/products/catalog/brava-power-900.jpg` |
| p105 | Fritadeira Air Fryer Brava Crisp 5,5 L Digital 1500W, Preto | `/images/products/catalog/brava-crisp-55-preto.jpg` |
| p106 | Fritadeira Air Fryer Brava Crisp 5,5 L Digital 1500W, Branco | `/images/products/catalog/brava-crisp-55-branco.webp` |
| p112 | Luminária de Mesa LED Lumio Desk Articulada com 3 Temperaturas de Cor | `/images/products/catalog/lumio-desk-led.jpg` |
| p115 | Aspirador de Pó Vertical Limpax Turbo 2 em 1 1250W | `/images/products/catalog/limpax-turbo-2em1.jpg` |
| p116 | Robô Aspirador Limpax Smart S Wi-Fi com Mapeamento | `/images/products/catalog/limpax-smart-s.jpg` |
| p120 | Secador de Cabelo Belfiore Ion 2100W com Tecnologia Íon, Preto | `/images/products/catalog/belfiore-ion-2100-preto.jpg` |
| p121 | Secador de Cabelo Belfiore Ion 2100W com Tecnologia Íon, Rosa | `/images/products/catalog/belfiore-ion-2100-rosa.jpg` |
| p122 | Escova Secadora Belfiore Volume 1200W 3 Temperaturas | `/images/products/catalog/belfiore-volume.jpg` |
| p123 | Prancha Alisadora Belfiore Titanium 230 °C Bivolt | `/images/products/catalog/belfiore-titanium.jpg` |
| p124 | Barbeador Elétrico Axion Rotary 3 Lâminas à Prova d'Água | `/images/products/catalog/axion-rotary-3.jpg` |
| p125 | Aparador de Pelos Axion Trim 10 em 1 Recarregável | `/images/products/catalog/axion-trim-10.jpg` |
| p128 | Dom Casmurro - Machado de Assis (Edição de Bolso) | `/images/products/catalog/dom-casmurro.jpg` |
| p129 | Memórias Póstumas de Brás Cubas - Machado de Assis | `/images/products/catalog/memorias-postumas.jpg` |
| p130 | O Cortiço - Aluísio Azevedo | `/images/products/catalog/o-cortico.jpg` |
| p131 | Iracema - José de Alencar | `/images/products/catalog/iracema.jpg` |
| p132 | A Moreninha - Joaquim Manuel de Macedo | `/images/products/catalog/a-moreninha.jpg` |
| p133 | Camiseta Esportiva Kinetik Dry Fit Masculina com Proteção UV, Preto | `/images/products/catalog/kinetik-dryfit-preto.jpg` |
| p134 | Camiseta Esportiva Kinetik Dry Fit Masculina com Proteção UV, Branco | `/images/products/catalog/kinetik-dryfit-branco.png` |
| p135 | Legging Fitness Kinetik Cintura Alta Anti-transparência, Preto | `/images/products/catalog/kinetik-legging-preto.jpg` |
| p136 | Legging Fitness Kinetik Cintura Alta Anti-transparência, Cinza | `/images/products/catalog/kinetik-legging-cinza.jpg` |
| p137 | Legging Fitness Kinetik Cintura Alta Anti-transparência, Verde | `/images/products/catalog/kinetik-legging-verde.jpg` |
| p138 | Par de Halteres Emborrachados Atlas 5 kg | `/images/products/catalog/atlas-halter-5kg.jpg` |
| p139 | Tapete de Yoga Atlas TPE 6 mm Antiderrapante com Alça, Azul | `/images/products/catalog/atlas-yoga-6mm-azul.jpg` |
| p140 | Tapete de Yoga Atlas TPE 6 mm Antiderrapante com Alça, Verde | `/images/products/catalog/atlas-yoga-6mm-verde.jpg` |
| p141 | Garrafa Térmica Esportiva Hydra 750 ml em Aço Inox, Preto | `/images/products/catalog/hydra-750-preto.jpg` |
| p142 | Garrafa Térmica Esportiva Hydra 750 ml em Aço Inox, Branco | `/images/products/catalog/hydra-750-branco.jpg` |
| p143 | Garrafa Térmica Esportiva Hydra 750 ml em Aço Inox, Azul | `/images/products/catalog/hydra-750-azul.jpg` |
