//declaração de variáveis
const fall = new Audio();
const jump = new Audio();
const hit = new Audio();
const score = new Audio();
fall.src = "./efeitos/caiu.wav"; 
hit.src = "./efeitos/hit.wav";
score.src = "./efeitos/ponto.wav";
jump.src = "./efeitos/pulo.wav";

const sourceImg = new Image();
sourceImg.src = './sprites.png';
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
let frames = 0;
let melhorPontuacao = 0;

//criando o objeto do ator e seus métodos.

function colisao(flappyBird, chao){
  const flappyBirdY = flappyBird.canvaY + flappyBird.height;
  const chaoY = chao.canvaY;

  if(flappyBirdY >= chaoY){
      return true;
  }
    return false;
};

function criaFlappyBird(){
  const flappyBird = {
    sourceX: 0,  
    sourceY: 0, ////posição do item dentro da imagem.
    width: 33,
    height: 24, ////dimensão do recorte da imagem.
    canvaX: 10,
    canvaY: 50, ////posição da imagem dentro do canva
    velocidade: 0,
    gravidade: 0.25,
    pulo: 3.6,
    pula(){
      flappyBird.velocidade = -flappyBird.pulo
      jump.play();
    },
    atualiza(){
      if(colisao(flappyBird, globais.chao)){
        hit.play();
        mudaParaTela(telas.gameOver);
        return;
      }
  
      flappyBird.velocidade = flappyBird.velocidade + flappyBird.gravidade;
      flappyBird.canvaY = flappyBird.canvaY + flappyBird.velocidade;
    },
    movimentos: [
      {sourceX: 0, sourceY: 0, },
      {sourceX: 0, sourceY: 26, },
      {sourceX: 0, sourceY: 52, },
      {sourceX: 0, sourceY: 26, },
    ],
    frameAtual: 0,
    atualizaFrame(){
        const intervaloFrames = 10;
        const passouIntervalo = frames % intervaloFrames === 0;
        if(passouIntervalo){
            const baseIncremento = 1;
            const incremento = baseIncremento + flappyBird.frameAtual;
            const baseRepeticao = flappyBird.movimentos.length;
            flappyBird.frameAtual = incremento % baseRepeticao;
        };      
    },
    desenha(){
      flappyBird.atualizaFrame();
      const {sourceX, sourceY} = flappyBird.movimentos[flappyBird.frameAtual];
      context.drawImage(
        sourceImg,
        sourceX, sourceY,
        flappyBird.width, flappyBird.height, 
        flappyBird.canvaX, flappyBird.canvaY,
        flappyBird.width, flappyBird.height, 
        );
    }
  }
  return flappyBird;
};


//criando o objeto background e seus métodos.
const fundo = {  
  sourceX: 390,  
  sourceY: 0, 
  width: 320,
  height: 205,
  canvaX: 0,
  canvaY: canvas.height - 261,
  desenha(){ 
    //céu azul
    context.fillStyle = "#70c5ce";
    context.fillRect(0,0, canvas.width, canvas.height - 150);
    //floresta e prédios
    context.drawImage(
      sourceImg,
      fundo.sourceX, fundo.sourceY,
      fundo.width,   fundo.height, 
      fundo.canvaX,  fundo.canvaY,
      fundo.width,   fundo.height, 
      );
  }
}


//criando o objeto chão e seus métodos.
function criaChao (){
  const chao = {
    sourceX: 0,  
    sourceY: 610, ////posição do item dentro da imagem.
    width: 400,
    height: 112, ////dimensão do recorte da imagem.
    canvaX: 0,
    canvaY: canvas.height - 112, ////posição da imagem dentro do canva
    atualiza(){
      const movimentoChao = 1;
      const repeteEm = chao.height / 2;
      const movimentacao = chao.canvaX - movimentoChao;
      chao.canvaX = movimentacao % repeteEm;
    },
    desenha(){
      context.drawImage(
        sourceImg,
        chao.sourceX, chao.sourceY,
        chao.width,   chao.height, 
        chao.canvaX,  chao.canvaY,
        chao.width,   chao.height, 
        );
    }
  }
  return chao;
}

//criando canos e seus métodos;
function criaCanos(){
  const canos = {
    width: 52,
    height: 400,
    chao: {
      sourceX: 0,
      sourceY: 169,
    },
    ceu: {
      sourceX: 52,
      sourceY: 169,
    },
    espaco: 90,
    desenha(){
      canos.pares.forEach(function(par){
        const randomY = par.y;
        const espacoCanos = 90;
        const canoCeuX = par.x;
        const canoCeuY = randomY;

      //cano ceu
      context.drawImage(
        sourceImg,
        canos.ceu.sourceX, canos.ceu.sourceY,
        canos.width, canos.height,
        canoCeuX, canoCeuY,
        canos.width, canos.height,
      )
      //cano chao
      const canoChaoX = par.x;
      const canoChaoY = canos.height + espacoCanos + randomY;
      context.drawImage(
        sourceImg,
        canos.chao.sourceX, canos.chao.sourceY,
        canos.width, canos.height,
        canoChaoX, canoChaoY,
        canos.width, canos.height,
      )
      par.canoCeu = {
        x: canoCeuX,
        y: canos.height + canoCeuY
      }
      par.canoChao = {
        x: canoChaoX,
        y: canoChaoY,
      }
    })
    },
    colisaoFlappyBird(par) {
      const cabecaFlappy = globais.flappyBird.canvaY;
      const peFlappy = globais.flappyBird.canvaY + globais.flappyBird.height;
        
      if((globais.flappyBird.canvaX + globais.flappyBird.width) >= par.x) {
        if(cabecaFlappy <= par.canoCeu.y) {
          return true;
        }

        if(peFlappy >= par.canoChao.y) {
          return true;
        }
      }
        return false;

    },
    pares: [],
    atualiza(){
      const passou100Frames = frames % 100 === 0;
      if(passou100Frames){
        canos.pares.push({
          x: canvas.width,
          y: -150 * (Math.random() + 1),
        });
      }

      canos.pares.forEach(function(par){
        par.x = par.x -2;

        if(canos.colisaoFlappyBird(par)){
          hit.play();
          mudaParaTela(telas.gameOver);
        }

        if(par.x + canos.width <= 0){
          score.play();
          canos.pares.shift();
        }
      });
    }
  }
  return canos;
}




//criando a tela de início.
const getReady = {
  sourceX: 134,  
  sourceY: 0, 
  width: 174,
  height: 152, 
  canvaX: (canvas.width / 2) - 174 / 2,
  canvaY: 50,
  desenha(){
    context.drawImage(
      sourceImg,
      getReady.sourceX, getReady.sourceY,
      getReady.width,   getReady.height, 
      getReady.canvaX,  getReady.canvaY,
      getReady.width,   getReady.height, 
      );
  }
};

//tela game over

const msgGameOver = {
  sourceX: 134,  
  sourceY: 153, 
  width: 226,
  height: 200, 
  canvaX: (canvas.width / 2) - 226 / 2,
  canvaY: 50,
  desenha(){
    context.drawImage(
      sourceImg,
      msgGameOver.sourceX, msgGameOver.sourceY,
      msgGameOver.width,   msgGameOver.height, 
      msgGameOver.canvaX,  msgGameOver.canvaY,
      msgGameOver.width,   msgGameOver.height, 
      );
  },
  atualiza(pontuacao, melhorPlacar){
    
    //Placar Final
    context.font = '30px "VT323"';
    context.fillStyle = 'black';
    context.fillText(`${pontuacao}`, canvas.width - 80, 145);
    if(pontuacao > melhorPlacar){
      melhorPontuacao = pontuacao;
    }
    context.fillText(`${melhorPontuacao}`, canvas.width - 80, 190);

  },
};

function criaPlacar(){
  const placar = {
    pontuacao: 0,
    desenha(){
      context.font = '35px "VT323"';
      context.textAlign = 'right';
      context.fillStyle = "white";
      context.fillText(`${placar.pontuacao}`, canvas.width - 10, 35);
      placar.pontuacao;
    },
    atualiza(){
      const intervaloFrames = 25;
      const passouIntervalo = frames % intervaloFrames === 0;
      if(passouIntervalo){
        placar.pontuacao ++
      }
    },
  }
  return placar;
}

//[Medalha]
function criarMedalha() {
  const medalha = {
    spriteX: 0,
    spriteY: 78,
    largura: 44,
    altura: 44,
    x: 73,
    y: 137,
    pontuacaoFeita(pontuacao) { 
      if(pontuacao < 5){
        //medalha.spriteX = 48
      } 
      if(pontuacao >= 5 & pontuacao <= 10){
        medalha.spriteX = 48
      } 
      if(pontuacao >= 11  & pontuacao <= 20){
        medalha.spriteY = 124
      }
      if(pontuacao >= 21){
        medalha.spriteX = 48,
        medalha.spriteY = 124
      }
    },
    desenha(pontuacao) {
      medalha.pontuacaoFeita(pontuacao);
      context.drawImage(
        sourceImg,
        medalha.spriteX, medalha.spriteY,
        medalha.largura, medalha.altura,
        medalha.x, medalha.y,
        medalha.largura, medalha.altura,
      );
    }
  }
  return medalha;
}

const globais = {};
let telaAtiva = {};
function mudaParaTela(novaTela){
  telaAtiva = novaTela;

  if(telaAtiva.inicializa){
    telaAtiva.inicializa();
  }
}

const telas = { //objeto que mostra a tela inicial antes do jogo
  inicio: {
    inicializa(){
      globais.flappyBird = criaFlappyBird();
      globais.chao = criaChao();
      globais.canos = criaCanos();
    },
    desenha(){
      fundo.desenha();
      globais.flappyBird.desenha();
      globais.canos.desenha();
      globais.chao.desenha();
      getReady.desenha();
    },
    click(){
      mudaParaTela(telas.jogo)
    },
    atualiza(){
      globais.chao.atualiza();
    }
  }
};

telas.jogo = {
  inicializa(){
    globais.placar = criaPlacar();
  },
  desenha(){
    fundo.desenha();
    globais.canos.desenha();
    globais.chao.desenha();
    globais.flappyBird.desenha();
    globais.placar.desenha();
  },
  click(){
    globais.flappyBird.pula();
  },
  atualiza(){
    globais.canos.atualiza();
    globais.chao.atualiza();
    globais.flappyBird.atualiza();
    globais.placar.atualiza();
  }
};

telas.gameOver = {
  inicializa(){
    globais.medalha = criarMedalha();
  },
  desenha(){
    msgGameOver.desenha();
    globais.medalha.desenha(globais.placar.pontuacao);
  },
  atualiza (){
    msgGameOver.atualiza(globais.placar.pontuacao, melhorPontuacao);
  },
  click(){
    mudaParaTela(telas.inicio);
  },
}

function init (){
  telaAtiva.desenha();
  telaAtiva.atualiza();
  frames++;
  requestAnimationFrame(init);
};


window.addEventListener('click', function(){
  if(telaAtiva.click){
      telaAtiva.click();
  }
});

mudaParaTela(telas.inicio);
init();