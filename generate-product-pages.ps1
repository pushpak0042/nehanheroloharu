$pages = @(
    [pscustomobject]@{
        file = 'karizma.html'
        name = 'Karizma XMR'
        tag = 'Sport Tourer'
        desc = 'Aggressive styling with aerodynamic design and premium performance built for spirited rides.'
        hero = 'karizma red.png'
        specs = @(@('Engine','210cc'),@('Power','25.5 PS'),@('Type','Touring Sport'))
        variants = @(@('karizma red.png','Turbo Red'),@('karizma yellow.png','Iconic Yellow'),@('karizma black.png','Stealth Black'))
        highlights = @('Performance tuning for high-speed stability.','Full-faired body design built for airflow efficiency.','Comfort-focused ergonomics for long rides.')
    },
    [pscustomobject]@{
        file = 'mavrick 440.html'
        name = 'Mavrick 440'
        tag = 'Premium Roadster'
        desc = 'Muscular roadster stance with strong torque delivery and mature premium styling.'
        hero = 'mavrick top black.png'
        specs = @(@('Engine','440cc'),@('Torque','36 Nm'),@('Type','Roadster'))
        variants = @(@('mavrick top black.png','Phantom Black'),@('mavrick mid blue.png','Nexus Blue'),@('maverick base white.png','Arctic White'))
        highlights = @('Strong low-end torque for city and highway.','Wide seat posture for daily comfort.','Road presence with bold body proportions.')
    },
    [pscustomobject]@{
        file = 'x pluse 210.html'
        name = 'Xpulse 210'
        tag = 'Adventure'
        desc = 'Adventure-focused motorcycle tuned for mixed terrain capability and all-day usability.'
        hero = 'xpulse 210 main pic.webp'
        specs = @(@('Engine','210cc'),@('Class','Adventure'),@('Focus','Dual Terrain'))
        variants = @(@('xpulse 210 main pic.webp','Adventure Grey'),@('xpulse 210 white.png','Summit White'))
        highlights = @('Suspension travel optimized for rough roads.','Upright stance for better rider control.','Designed for city rides and weekend trails.')
    },
    [pscustomobject]@{
        file = 'x pluse 210 4v.html'
        name = 'Xpulse 210 4V'
        tag = 'Rally Inspired'
        desc = '4-valve adventure machine inspired by rally dynamics and long-distance ride confidence.'
        hero = '200 4v dakar edition.png'
        specs = @(@('Engine','210cc 4V'),@('Power','21 PS'),@('Style','Rally'))
        variants = @(@('200 4v dakar edition.png','Dakar Edition'),@('200 4v sporty red.png','Sporty Red'),@('200 4v blue.png','Rally Blue'),@('200 4v grey.png','Trail Grey'),@('200 4v mate blue.png','Matte Blue'))
        highlights = @('Advanced 4-valve engine setup.','Rally-inspired graphic identity.','Tour-ready adventure riding geometry.')
    },
    [pscustomobject]@{
        file = 'xtreme 250r.html'
        name = 'Xtreme 250R'
        tag = 'Street Performance'
        desc = 'Sharp streetfighter design paired with quarter-litre class performance and handling.'
        hero = 'xtreme 250r red.png'
        specs = @(@('Engine','250cc'),@('Power','25.5 PS'),@('Style','Naked Sport'))
        variants = @(@('xtreme 250r red.png','Performance Red'),@('250r black.png','Stealth Black'),@('250r neon.png','Neon Strike'))
        highlights = @('Sport-focused ergonomics and sharp handling.','Built for quick response in urban rides.','Bold styling with aggressive visual stance.')
    },

    [pscustomobject]@{
        file = 'splendor+.html'
        name = 'Splendor+'
        tag = 'Commuter Icon'
        desc = 'Trusted commuter built for high reliability, mileage, and daily practicality.'
        hero = 'splendor black red.png'
        specs = @(@('Engine','97.2cc'),@('Type','Commuter'),@('Mileage','High'))
        variants = @(@('splendor black red.png','Black Red'),@('splendor pure silver.png','Pure Silver'),@('splendor police colour.png','Police Blue'),@('splendor silver.png','Silver'))
        highlights = @('Reliable everyday commuting performance.','Low-maintenance ownership proposition.','Comfortable geometry for daily rides.')
    },
    [pscustomobject]@{
        file = 'splendor+ xtech.html'
        name = 'Splendor+ XTEC'
        tag = 'Connected Commuter'
        desc = 'Connected commuter with modern styling accents and smart utility features.'
        hero = 'xtech tornado grey.png'
        specs = @(@('Engine','97.2cc'),@('Type','Commuter'),@('Feature','XTEC Tech'))
        variants = @(@('xtech tornado grey.png','Tornado Grey'),@('xtech red black.png','Red Black'),@('xtech 2.0 bkack grey.png','Black Grey'),@('xtech 2.0 nobal red.png','Noble Red'),@('xtech 2.o silver grey.png','Silver Grey'))
        highlights = @('XTEC-focused technology package.','Premium graphics and practical utility.','Best-suited for modern daily riders.')
    },
    [pscustomobject]@{
        file = 'hf deleux.html'
        name = 'HF Deluxe'
        tag = 'Daily Mobility'
        desc = 'Practical and affordable commuter engineered for everyday riding needs.'
        hero = 'hf red black.png'
        specs = @(@('Engine','97.2cc'),@('Type','Commuter'),@('Focus','Efficiency'))
        variants = @(@('hf red black.png','Red Black'),@('hf black blue.png','Black Blue'),@('hf grey silver.png','Grey Silver'))
        highlights = @('Balanced ride for city commuting.','Built for long-term durability.','Economical daily ownership support.')
    },
    [pscustomobject]@{
        file = 'hf-deluxe-pro.html'
        name = 'HF Deluxe Pro'
        tag = 'Premium Commuter'
        desc = 'Upgraded HF series variant designed with premium color themes and commuter comfort.'
        hero = 'hf pro black grey.png'
        specs = @(@('Engine','97.2cc'),@('Type','Commuter Pro'),@('Focus','Comfort'))
        variants = @(@('hf pro black grey.png','Black Grey'),@('hf pro black red.png','Black Red'),@('hf pro lime yellow.png','Lime Yellow'),@('hf pro nexus blue.png','Nexus Blue'))
        highlights = @('Premium commuter aesthetics.','Comfort-first daily riding setup.','Trusted engine platform for efficiency.')
    },
    [pscustomobject]@{
        file = 'hf 100.html'
        name = 'HF 100'
        tag = 'Entry Commuter'
        desc = 'Simple and reliable entry-level commuter designed for value and utility.'
        hero = 'hf 100 blue black.png'
        specs = @(@('Engine','97.2cc'),@('Type','Entry Commuter'),@('Focus','Value'))
        variants = @(@('hf 100 blue black.png','Blue Black'),@('hf 100 red black.png','Red Black'))
        highlights = @('Affordable and dependable mobility.','Easy handling for daily usage.','Low running-cost commuter category.')
    },
    [pscustomobject]@{
        file = 'passion.html'
        name = 'Passion+'
        tag = 'Style Commuter'
        desc = 'Stylish commuter with practical performance and comfort-oriented riding posture.'
        hero = 'passion black red.png'
        specs = @(@('Engine','97.2cc'),@('Type','Commuter'),@('Identity','Stylish'))
        variants = @(@('passion black red.png','Black Red'),@('passion black grey.png','Black Grey'),@('passion blue.png','Blue'),@('passion brown.png','Brown'),@('passion 125 million edition.png','125 Million Edition'))
        highlights = @('Style-forward commuter design.','Refined city commuting ergonomics.','Built for reliable long-term use.')
    },
    [pscustomobject]@{
        file = 'glamour.html'
        name = 'Glamour'
        tag = '125cc Commuter'
        desc = '125cc commuter balancing comfort, style, and performance for daily city travel.'
        hero = 'glamour black silver.png'
        specs = @(@('Engine','125cc'),@('Type','Commuter'),@('Focus','Refined Ride'))
        variants = @(@('glamour black silver.png','Black Silver'),@('glamour black red.png','Black Red'),@('glamour blue.png','Blue'),@('glamour red.png','Red'))
        highlights = @('Refined 125cc commuter experience.','Designed for smooth urban operation.','Premium visual appeal in commuter class.')
    },
    [pscustomobject]@{
        file = 'glamor xtech.html'
        name = 'Glamour XTEC'
        tag = 'Tech Variant'
        desc = 'Advanced Glamour variant with added technology features and premium finish.'
        hero = 'glamour x.png'
        specs = @(@('Engine','125cc'),@('Type','Tech Commuter'),@('Feature','XTEC'))
        variants = @(@('glamour x.png','Base Silver'),@('glamour x silver.png','Silver'),@('glamour x red.png','Red'),@('gla x nexus blue.png','Nexus Blue'),@('glamour x bue.png','Blue'))
        highlights = @('XTEC feature-rich variant setup.','Enhanced digital and utility focus.','Premium commuter styling package.')
    },
    [pscustomobject]@{
        file = 'super splendor.html'
        name = 'Super Splendor'
        tag = '125cc Daily Ride'
        desc = 'Trusted 125cc motorcycle built for stronger daily performance and ride confidence.'
        hero = 'super black.png'
        specs = @(@('Engine','125cc'),@('Type','Commuter 125'),@('Focus','Everyday Performance'))
        variants = @(@('super black.png','Black'),@('super blue.png','Blue'),@('super red.png','Red'),@('super grey.png','Grey'))
        highlights = @('125cc power for versatile commuting.','Comfortable ride stance and seating.','Proven reliability across road conditions.')
    },
    [pscustomobject]@{
        file = 'xtreme 125.html'
        name = 'Xtreme 125'
        tag = 'Street Sport'
        desc = 'Sport-inspired 125cc motorcycle tuned for urban agility and youthful design.'
        hero = 'xtreme 125 main.jpeg'
        specs = @(@('Engine','125cc'),@('Type','Street Sport'),@('Focus','Agility'))
        variants = @(@('xtreme 125 main.jpeg','Street Black'),@('xtreme blue 125r.jpeg','Blue'))
        highlights = @('Sporty styling for urban riders.','Lightweight feel for daily maneuvering.','Performance-oriented 125cc character.')
    },
    [pscustomobject]@{
        file = 'xtreme 125r.html'
        name = 'Xtreme 125R'
        tag = 'Sporty 125'
        desc = 'New-age 125cc street machine with aggressive design and sharp handling feel.'
        hero = 'xtreme 125r black.jpeg'
        specs = @(@('Engine','125cc'),@('Type','Street Sport'),@('Focus','Performance'))
        variants = @(@('xtreme 125r black.jpeg','Black'),@('xtreme 125r.jpeg','Grey'),@('xtreme blue 125r.jpeg','Blue'))
        highlights = @('Bold front-end street styling.','Responsive 125cc riding performance.','City-focused sporty handling setup.')
    },
    [pscustomobject]@{
        file = 'xtreme 160.html'
        name = 'Xtreme 160R'
        tag = 'Naked Performance'
        desc = 'Performance-oriented 160cc naked motorcycle designed for sporty everyday rides.'
        hero = 'xtreme 1604v.jpeg'
        specs = @(@('Engine','160cc'),@('Type','Naked Sport'),@('Focus','Performance'))
        variants = @(@('xtreme 1604v.jpeg','Silver'),@('xtreme 1604v green.jpeg','Green'))
        highlights = @('Dynamic acceleration and control.','Streetfighter-inspired body design.','Everyday usability with sporty appeal.')
    },
    [pscustomobject]@{
        file = 'xtreme 160 4v.html'
        name = 'Xtreme 160 4V'
        tag = '4-Valve Street'
        desc = '4-valve 160cc street machine tuned for stronger top-end and sharper ride character.'
        hero = 'xtreme 1604v green.jpeg'
        specs = @(@('Engine','160cc 4V'),@('Type','Street Sport'),@('Focus','Top-end Power'))
        variants = @(@('xtreme 1604v green.jpeg','Green'),@('xtreme 1604v.jpeg','Silver'))
        highlights = @('4-valve engine performance profile.','Sport-oriented riding confidence.','Distinct graphics and street stance.')
    },

    [pscustomobject]@{
        file = 'xoom 110.html'
        name = 'Xoom 110'
        tag = 'Sport Scooter'
        desc = 'Sporty city scooter designed for quick mobility and youthful style.'
        hero = 'xoom 110 vx yellow.png'
        specs = @(@('Engine','110cc'),@('Type','Scooter'),@('Focus','Urban Sport'))
        variants = @(@('xoom 110 vx yellow.png','VX Yellow'),@('xoom 110 vx blue.png','VX Blue'),@('xoom 110 black vx.png','VX Black'),@('xoom 110 combat grey.png','Combat Grey'),@('xoom 110 red.avif','Red'))
        highlights = @('Sport-first scooter styling cues.','Quick city maneuverability profile.','Comfortable commute-oriented design.')
    },
    [pscustomobject]@{
        file = 'xoom 125.html'
        name = 'Xoom 125'
        tag = 'Performance Scooter'
        desc = '125cc performance scooter balancing city comfort with stronger ride response.'
        hero = 'xoom 125 blue.png'
        specs = @(@('Engine','125cc'),@('Type','Scooter'),@('Focus','Performance'))
        variants = @(@('xoom 125 blue.png','Blue'),@('xoom mate grey 125.png','Matte Grey'),@('xoom 15 zx red.png','ZX Red'),@('xoom 125 zx yellow.png','ZX Yellow'))
        highlights = @('125cc scooter performance tuning.','Aggressive styling and posture.','Designed for versatile urban use.')
    },
    [pscustomobject]@{
        file = 'xoom160.html'
        name = 'Xoom 160'
        tag = 'Maxi Crossover'
        desc = 'Maxi-style crossover scooter designed for premium urban touring feel.'
        hero = 'xoom 160 zx green.png'
        specs = @(@('Engine','160cc'),@('Type','Maxi Scooter'),@('Focus','Premium Urban'))
        variants = @(@('xoom 160 zx green.png','ZX Green'),@('xoom 160 grey.png','Grey'),@('xoom 169 zx white.png','ZX White'))
        highlights = @('Maxi-style body proportions.','Comfort-forward long ride posture.','Premium scooter road presence.')
    },
    [pscustomobject]@{
        file = 'destini 110.html'
        name = 'Destini 110'
        tag = 'Family Scooter'
        desc = 'Family-oriented scooter designed around comfort and practical everyday use.'
        hero = 'destini 110 vx white.png'
        specs = @(@('Engine','110cc'),@('Type','Scooter'),@('Focus','Family Comfort'))
        variants = @(@('destini 110 vx white.png','VX White'))
        highlights = @('Comfort-focused seat and ride geometry.','Smooth city commuting behavior.','Designed for family convenience.')
    },
    [pscustomobject]@{
        file = 'destini 125 .html'
        name = 'Destini 125'
        tag = 'Metal Body Comfort'
        desc = 'Premium family scooter with metal body character and comfort-led package.'
        hero = 'destini zx blue.png'
        specs = @(@('Engine','125cc'),@('Type','Scooter'),@('Focus','Comfort Plus'))
        variants = @(@('destini zx blue.png','ZX Blue'),@('destini vx black.png','VX Black'),@('destini zx red.png','ZX Red'),@('destini zx light shade.png','ZX Light'))
        highlights = @('Comfort-enhanced family scooter profile.','Premium surface and body treatment.','Built for smooth daily practicality.')
    },
    [pscustomobject]@{
        file = 'pleasure 100.html'
        name = 'Pleasure+'
        tag = 'Light and Stylish'
        desc = 'Lightweight and stylish scooter platform engineered for easy city rides.'
        hero = 'pleasure vx blue.png'
        specs = @(@('Engine','110cc'),@('Type','Scooter'),@('Focus','Easy Ride'))
        variants = @(@('pleasure vx blue.png','VX Blue'),@('pleasure red vx.png','VX Red'),@('pleasure lx red.png','LX Red'),@('pleasure lx blue.png','LX Blue'),@('pleasure zx grey.png','ZX Grey'),@('pleasure zx peral blue.png','ZX Pearl Blue'),@('pleseare black zx.png','ZX Black'))
        highlights = @('Light handling and easy maneuverability.','Urban-friendly scooter design.','Multiple style-focused variants.')
    },

    [pscustomobject]@{
        file = 'vida v1.html'
        name = 'VIDA V1'
        tag = 'Electric Mobility'
        desc = 'Connected electric scooter platform with smart features and urban range usability.'
        hero = 'vida blue v2.svg'
        specs = @(@('Power','Electric'),@('Range','IDC up to 143 km'),@('Type','Smart EV'))
        variants = @(@('vida black.svg','Black'),@('vida blue v2.svg','Blue'),@('vida red.svg','Red'),@('vida v2 white.svg','White'))
        highlights = @('Connected EV ecosystem support.','Practical city range profile.','Modern design with smart feature set.')
    }
)

function New-VariantHtml($variants, $hero) {
    $out = @()
    foreach($v in $variants) {
        $img = $v[0]
        $label = $v[1]
        if(-not (Test-Path -Path $img)) { continue }
        $out += "<button class='variant-btn' type='button' data-image='$img' aria-pressed='false'><img src='$img' alt='$label'><strong>$label</strong></button>"
    }
    if($out.Count -eq 0) {
        return "<button class='variant-btn is-active' type='button' data-image='$hero' aria-pressed='true'><img src='$hero' alt='Default'><strong>Standard</strong></button>"
    }
    return ($out -join "`r`n")
}

foreach($p in $pages) {
    $hero = if(Test-Path -Path $p.hero) { $p.hero } else { 'nehan hero logo.png' }
    $variantHtml = New-VariantHtml -variants $p.variants -hero $hero
    $bookingProduct = [System.Uri]::EscapeDataString($p.name)

    $specHtml = ""
    foreach($s in $p.specs) {
        $specHtml += "<div class='product-spec'><span>$($s[0])</span><strong>$($s[1])</strong></div>`r`n"
    }

    $h1 = $p.highlights[0]
    $h2 = $p.highlights[1]
    $h3 = $p.highlights[2]

    $html = @"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>$($p.name) | Hero MotoCorp</title>
    <link rel='preconnect' href='https://fonts.googleapis.com'>
    <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>
    <link href='https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Sora:wght@400;500;600&display=swap' rel='stylesheet'>
    <link rel='stylesheet' href='product-page.css'>
</head>
<body>
    <header class='sub-header'>
        <div class='sub-header-inner'>
            <a class='sub-brand' href='index.html' aria-label='Hero Home'>
                <img src='nehan hero logo.png' alt='Hero MotoCorp'>
            </a>
            <button class='sub-menu-toggle' id='subMenuToggle' aria-expanded='false' aria-controls='subNav' aria-label='Toggle navigation'>
                <span></span><span></span><span></span>
            </button>
            <nav class='sub-nav' id='subNav'>
                <ul class='sub-nav-links'>
                    <li><a href='index.html' class='active'>Home</a></li>
                    <li><a href='index.html#find-ride'>Products</a></li>
                    <li><a href='index.html#ownership'>Ownership</a></li>
                    <li><a href='index.html#community'>Community</a></li>
                    <li><a href='contact.html'>Contact</a></li>
                </ul>
                <a class='btn-book' href='booking.html?product=$bookingProduct'>Book Now</a>
            </nav>
        </div>
    </header>
    <div class='sub-menu-backdrop' id='subMenuBackdrop' hidden></div>

    <main class='product-main'>
        <section class='product-hero'>
            <div class='product-copy'>
                <span class='product-tag'>$($p.tag)</span>
                <h1>$($p.name)</h1>
                <p>$($p.desc)</p>

                <div class='product-specs'>
                    $specHtml
                </div>

                <div class='product-actions'>
                    <a class='btn-book' href='booking.html?product=$bookingProduct'>Book This Model</a>
                    <a class='btn-outline' href='index.html#find-ride'>Back to Product Hub</a>
                    <a class='btn-outline' href='booking.html?type=service&product=$bookingProduct'>Book Service</a>
                </div>
            </div>

            <div class='product-visual'>
                <div class='product-visual-main'>
                    <img id='productMainImage' src='$hero' alt='$($p.name)'>
                </div>
            </div>
        </section>

        <section class='variant-section'>
            <h2>Color & Variant Preview</h2>
            <div class='variant-grid'>
                $variantHtml
            </div>
        </section>

        <section class='highlights'>
            <article class='highlight-card'>
                <h3>Performance</h3>
                <p>$h1</p>
            </article>
            <article class='highlight-card'>
                <h3>Design</h3>
                <p>$h2</p>
            </article>
            <article class='highlight-card'>
                <h3>Ownership</h3>
                <p>$h3</p>
            </article>
        </section>

        <p class='sub-footer'>Hero MotoCorp &middot; Model Showcase Page &middot; Nehan Hero Loharu</p>
    </main>

    <script src='product-page.js'></script>
</body>
</html>
"@

    Set-Content -Path $p.file -Value $html -NoNewline
    Write-Output "Generated: $($p.file)"
}
