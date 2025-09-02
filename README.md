Phantom Skies: B2 Spirit Edition ✈️🔥

Um jogo de ação vertical-scroller inspirado nos clássicos de fliperama, desenvolvido em HTML5, CSS3 e JavaScript puro, agora com novos modos de tiro progressivos, sistema de vidas, sons imersivos e mecânicas modernas.

<img src="https://github.com/AlexandreSilva78/Phantom-Skies-B2-Spirit-Edition/blob/main/assets/img/Jogo-Phantom-Skies-B2-Spirit-Edition-Notebook.png" style= "width: 350px; height:         350px;">


📋 Descrição

Phantom Skies: B2 Spirit Edition é um jogo de ação onde o jogador controla um avião B2 Spirit que avança automaticamente para cima, enfrentando inimigos terrestres e aéreos, recolhendo combustível e sobrevivendo o máximo possível.

O jogo conta com:

Múltiplos níveis com dificuldade crescente

Sistema progressivo de tiros (1 → 3 → 5 → 7)

Pontuação e vidas extras ao longo da progressão

Efeitos sonoros para tiros, explosões e abastecimento

HUD completo com pontuação, nível, combustível, vidas e modo de tiro

🎮 Como Jogar
Controles
Teclado (Desktop)

Setas ← / → ou A / D: mover esquerda/direita

Seta ↑ ou W: acelerar (subir mais rápido)

Seta ↓ ou S: reduzir velocidade (descer mais lento)

Barra de Espaço: atirar

F: alternar entre os modos de tiro já desbloqueados

Esc: pausar jogo

T: ativar/desativar modo depuração

Mobile:

<img src:"

Botões de direção na tela para mover

Botão 🔥 para atirar

Botão P para alternar modo de tiro

🔫 Modos de Tiro Progressivos

O jogador começa apenas com 1 tiro por vez.
Novos modos são desbloqueados conforme a quantidade de inimigos destruídos:

1 Tiro (padrão) → Sempre disponível

3 Tiros → liberado após 100 inimigos destruídos

5 Tiros → liberado após 200 inimigos destruídos

7 Tiros → liberado após 500 inimigos destruídos

➡️ Após desbloquear, o jogador pode alternar entre todos os modos conquistados pressionando F (ou o botão P no mobile).
➡️ Sempre que um novo modo é desbloqueado, uma mensagem rápida aparece na tela.

🎯 Objetivos

Destruir inimigos para ganhar pontos

Recolher combustível para não ficar sem energia

Evitar colidir com obstáculos e inimigos

Sobreviver o máximo possível

Avançar pelos níveis (até 99 no total)

🔊 Efeitos Sonoros

Os sons adicionam mais imersão ao jogo:

Tiro → assets/audio/missel-1.mp3

Explosão de inimigos → assets/audio/explosao-inimigos.mp3

Explosão de postos de combustível → assets/audio/explosao.mp3

Abastecimento → assets/audio/Abastecimento.mp3

🚀 Como Executar
Método 1: Servidor HTTP Local (Recomendado)
python3 -m http.server 8000


Acesse no navegador: http://localhost:8000

Método 2: Abrir Diretamente

Abra index.html no navegador.
⚠️ Algumas funções podem não funcionar corretamente devido a restrições de CORS.

📁 Estrutura do Projeto
phantom_skies_game/
├── index.html              # Página principal do jogo
├── styles.css              # Estilos do HUD e layout
├── main.js                 # Lógica completa do jogo
├── README.md               # Documentação
└── assets/                 # Recursos visuais e sonoros
    ├── img/                # Imagens do jogo
    │   ├── player.png
    │   ├── enemies/
    │   ├── background.png
    │   └── ...
    └── audio/              # Sons do jogo
        ├── missel-1.mp3
        ├── explosao.mp3
        ├── explosao-inimigos.mp3
        └── Abastecimento.mp3

⚙️ Mecânicas do Jogo

Sistema de Combustível: diminui constantemente; coletar postos recarrega.

Sistema de Vidas: começa com 5; vidas extras podem ser conquistadas.

Progressão de Níveis: cada nível dura 90s; dificuldade aumenta 5% por nível.

Pontuação: varia conforme inimigo destruído; bônus por abastecimento e power-ups.

🎨 Características Técnicas

Renderização via HTML5 Canvas

Somente JavaScript puro (ES6+)

Design responsivo para desktop e mobile

Sistema otimizado com pooling de objetos e remoção de entidades fora da tela

Animações suaves e efeitos de partículas nas explosões

📄 Licença

Este projeto está licenciado sob a MIT License.

Divirta-se jogando Phantom Skies: B2 Spirit Edition! ✈️🔥
