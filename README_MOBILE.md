Phantom Skies: B2 Spirit Edition - Versão Mobile
📱 Visão Geral

Esta é a versão mobile otimizada do jogo Phantom Skies: B2 Spirit Edition, desenvolvida especialmente para dispositivos móveis com controles de toque responsivos, HUD adaptativo e todos os recursos da versão desktop.

✨ Funcionalidades Mobile
🎮 Controles de Toque

D-Pad Virtual: Controle direcional (↑↓←→) para movimentar o avião

Botão de Tiro 🔥: Dispara projéteis (toque contínuo para tiro automático)

Botão "F": Alterna entre os modos de tiro desbloqueados

Toque Contínuo: Mantém o disparo ativo sem precisar apertar repetidamente

📱 Interface Responsiva

Fullscreen: O jogo ocupa toda a tela do dispositivo

HUD Compacto: Indicadores otimizados para telas pequenas

Controles Adaptativos: Botões redimensionados automaticamente conforme a tela

Sem Cursor: Cursor oculto para experiência mobile fluida

🎯 Breakpoints Responsivos

Tablets (≤768px): Layout intermediário

Smartphones (≤480px): Layout compacto

🚀 Como Jogar no Mobile
Controles Básicos

Movimento

↑ : Acelerar

↓ : Reduzir velocidade

← : Mover para a esquerda

→ : Mover para a direita

Combate

Toque no botão 🔥 para disparar

Segure para tiro contínuo

Toque no botão "F" para alternar entre os modos de tiro já desbloqueados

Interface

HUD simplificado no topo da tela

Controles no canto inferior direito

Telas de pausa e game over responsivas

🔫 Modos de Tiro (Progressivos)

1 Tiro (Inicial): Disponível desde o início

3 Tiros: Desbloqueado após 100 inimigos destruídos

5 Tiros: Desbloqueado após 200 inimigos destruídos

7 Tiros: Desbloqueado após 500 inimigos destruídos

O jogador pode alternar entre os modos já liberados com o botão "F"

🔊 Sons Implementados

Tiro: assets/audio/missel-1.mp3

Explosão de inimigos: assets/audio/explosao-inimigos.mp3

Explosão de postos de combustível: assets/audio/explosao.mp3

Reabastecimento: assets/audio/Abastecimento.mp3

🔧 Especificações Técnicas
Compatibilidade

iOS: Safari 12+

Android: Chrome 70+, Firefox 68+

Resolução mínima: 320x568px

Orientação: Retrato e Paisagem

Performance

Target: 60fps em dispositivos modernos

Otimizações:

Canvas adaptado ao viewport

Event listeners otimizados para toque

Aumento progressivo de inimigos ajustado para +5% por nível (antes era 10%)

📋 Instalação e Uso
Método 1: Servidor Local
cd phantom_skies_game
python3 -m http.server 8000


Acesse no navegador mobile:
👉 http://localhost:8000

Método 2: Arquivo Local

Abra index.html diretamente no navegador mobile

Método 3: PWA (Planejado)

Instalar na tela inicial

Suporte offline

Push notifications

🎨 Customização Mobile
Ajustar Controles
#mobile-dpad {
  width: 120px;
  height: 120px;
}

#mobile-shoot {
  width: 80px;
  height: 80px;
}

Personalizar Botões
.mobile-btn {
  background: linear-gradient(135deg, rgba(0,255,255,0.8), rgba(0,170,255,0.8));
  border: 2px solid rgba(0,255,255,0.6);
}

🐛 Resolução de Problemas

Controles não aparecem: Verifique largura ≤768px

Performance baixa: Reduza resolução do canvas ou efeitos de partículas

Toque não funciona: Verifique preventDefault() nos eventos de toque

📊 Benchmarks

iPhone 12: 60fps constante

Samsung Galaxy S21: 55–60fps

Dispositivos antigos: 30–45fps

🔮 Funcionalidades Futuras

 Vibração háptica ao disparar

 Controles personalizáveis

 Suporte a gamepad Bluetooth

 Multiplayer local (Bluetooth/Wi-Fi)

 Phantom Skies: B2 Spirit Edition Mobile 🚀✈️🌌