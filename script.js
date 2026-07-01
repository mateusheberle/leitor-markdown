async function listarArquivos() {
    const list = document.getElementById('file-list');
    try {
        const resp = await fetch('https://api.github.com/repos/mateusheberle/artigos/contents/');
        if (!resp.ok) throw new Error('GitHub API retornou ' + resp.status);
        const entries = await resp.json();

        const mdFiles = entries.filter(e => e.type === 'file' && e.name.toLowerCase().endsWith('.md'));
        if (mdFiles.length === 0) {
            list.innerHTML = '<li>Nenhum arquivo .md encontrado.</li>';
            return;
        }

        list.innerHTML = '';
        mdFiles.forEach(file => {
            const title = file.name.replace(/\.md$/i, '');
            const li = document.createElement('li');
            li.className = 'file-item';
            const a = document.createElement('a');
            a.href = 'home.html?file=' + encodeURIComponent(file.path);
            a.className = 'file-link';
            a.textContent = title;
            li.appendChild(a);
            list.appendChild(li);
        });
    } catch (err) {
        list.innerHTML = '<li class="file-error">Erro ao carregar arquivos.</li>';
        console.error(err);
    }
}

listarArquivos();