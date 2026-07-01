marked.setOptions({
    highlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    }
});

async function carregarMarkdown() {

    const params = new URLSearchParams(window.location.search);
    const fileParam = params.get('file');
    const rawBase = 'https://raw.githubusercontent.com/mateusheberle/artigos/main/';
    const url = fileParam
        ? rawBase + fileParam.split('/').map(encodeURIComponent).join('/')
        : rawBase + '1.%20Introdu%C3%A7%C3%A3o%20%C3%A0%20Web.md';

    try {

        const resposta = await fetch(url);
        const markdown = await resposta.text();

        document.getElementById("content").innerHTML =
            marked.parse(markdown);

        document.querySelectorAll('#content pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

        // Normalize heading IDs and anchor links so TOC anchors work reliably
        function slugify(text) {
            return String(text)
                .normalize('NFD')                     // split accent from letters
                .replace(/\p{Diacritic}/gu, '')      // remove diacritics
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')        // remove invalid chars
                .trim()
                .replace(/\s+/g, '-')               // spaces to hyphens
                .replace(/-+/g, '-');                // collapse multiple hyphens
        }

        // Assign stable ids to headings based on their text
        document.querySelectorAll('#content h1, #content h2, #content h3, #content h4, #content h5, #content h6').forEach((h) => {
            const txt = h.textContent || h.innerText || '';
            const id = slugify(txt);
            if (id) h.id = id;
        });

        // Update internal anchor links to use the same slug format
        document.querySelectorAll('#content a[href^="#"]').forEach((a) => {
            const href = a.getAttribute('href');
            const raw = href.slice(1);
            const slug = slugify(decodeURIComponent(raw || ''));
            if (slug) a.setAttribute('href', '#' + slug);
        });

        // Generate a simple TOC and insert into #toc-list
        const tocContainer = document.getElementById('toc-list');
        if (tocContainer) {
            const headings = Array.from(document.querySelectorAll('#content h1, #content h2, #content h3'));
            if (headings.length === 0) {
                tocContainer.innerHTML = '<p>Sem seções encontradas.</p>';
            } else {
                // Build flat list; simple indentation by level
                const frag = document.createDocumentFragment();
                headings.forEach((h) => {
                    const a = document.createElement('a');
                    a.href = '#' + h.id;
                    a.textContent = h.textContent.trim();
                    a.className = 'toc-link level-' + (parseInt(h.tagName.substring(1)) || 1);
                    const item = document.createElement('div');
                    item.className = 'toc-item';
                    item.style.marginLeft = ((parseInt(h.tagName.substring(1)) - 1) * 20) + 'px';
                    item.appendChild(a);
                    frag.appendChild(item);
                });
                tocContainer.innerHTML = '';
                tocContainer.appendChild(frag);

                // Optional: highlight target heading briefly on click
                tocContainer.querySelectorAll('a').forEach((link) => {
                    link.addEventListener('click', (e) => {
                        // allow default navigation then flash
                        setTimeout(() => {
                            const target = document.querySelector(link.getAttribute('href'));
                            if (target) {
                                target.classList.add('toc-target-highlight');
                                setTimeout(() => target.classList.remove('toc-target-highlight'), 1200);
                            }
                        }, 50);
                    });
                });
            }
        }

    } catch (erro) {

        document.getElementById("content").innerHTML =
            "Erro ao carregar arquivo.";

        console.error(erro);
    }
}

carregarMarkdown();
