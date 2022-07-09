<!-- Logo -->

<h1 align="center" style="font-family: Ubuntu; font-size: 45px; color: #333; margin-bottom: 0">
  Passeios sobre modelo Sponza
</h1>

<!-- Description -->

<h4 align="center">
	UFBA - Instituto de Computação - MATE65 - 2022.1 - Natan Moura
</h4>

<!-- Summary -->

<h2>Guia</h2>

- [:book: Introdução](#book-introdução)
- [:rocket: Tecnologias](#rocket-tecnologias)
- [:boom: Como rodar](#boom-como-rodar)
    - [Prerequisitos](#prerequisitos)
    - [Rodando com xampp](#rodando-com-xampp)
- [:sparkles: Tipos de passeio](#sparkles-tipos-de-passeio)
- [:no_entry: Confinamento ao modelo](#no_entry-confinamento-ao-modelo)
- [:european_castle: Cubemap background](#european_castle-cubemap-background)

<a id="doc"></a>

<div align="justify">

<a id="introdução"></a>

## :book: Introdução

Esta é uma aplicação feita com ThreeJs para a disciplina MATE65 - Computação Gráfica com o objetivo de implementar três tipos de passeio sobre o modelo [Sponza](https://github.com/jimmiebergmann/Sponza). Os passeios correspondem a três modos distinto de visão:
- Modo "A pé" - Remete a uma pessoa caminhando dentro do modelo
- Modo "Drone" - Remete aos graus de liberdade de um drone voando sobre o modelo
- Modo "Visita Guiada" - Remete a uma visita automática sobre o modelo com pontos pré-definidos e um guia amigável
	
Obs: É possível utilizar a aplicação através do [link](https://ntsmoura.github.io/passeiocg/).

<a id="tecnologias"></a>

## :rocket: Tecnologias

Essa aplicação utiliza as seguintes tecnologias:

- [ThreeJs](https://threejs.org/)

<a id="como-executar"></a>

## :boom: Como rodar

#### Prerequisitos

Para rodar essa aplicação é necessário somente um servidor HTTP, como Apache, VS Code Live Server, Nginx, entre outros. Mostrarei um exemplo utilizando o apache através do [Xampp](https://www.apachefriends.org/pt_br/index.html)

#### Rodando com xampp

Após instalar o xampp e configurar o terminal para o diretório principal de onde instalei-o, executo a seguinte sequência de comandos:

```sh
# Muda para o diretório htdocs e clona o repositório
$ cd htdocs
$ git clone https://github.com/MATA65-2022-1/atividade-01---visita-guiada-virtual-ntsmoura/

```

Ao clonar o repositório estou fazendo download de todas as dependências da aplicação, já que estas estão incluídas na pasta [Assets](https://github.com/MATA65-2022-1/atividade-01---visita-guiada-virtual-ntsmoura/tree/main/Assets). No caso do Xampp, eu inicio o servidor Apache e em qualquer browser acesso o link http://localhost/atividade-01---visita-guiada-virtual-ntsmoura/Passeio.html. Algo similar a isto deve aparecer:

![tela_inicial](https://i.imgur.com/bEbBqpR.jpeg)


<a id="code-format"></a>

## :sparkles: Tipos de passeio

###### Modo "A pé"

O modo "A pé" é o primeiro da aplicação, ele simula o movimento de uma pessoa andando no modelo Sponza. Em termos de implementação ele foi feito utilizando o controlador [Pointer Lock](https://threejs.org/docs/#examples/en/controls/PointerLockControls) e os eventos de teclado para WASD. O "Lock" e o "Unlock" do Pointer Lock servem para habilitar o movimento travando o mouse, ou liberar o mouse e exibir o menu, parando a movimentação. Uma visão do modo "A pé":

<p align="center">
<img src="https://media.giphy.com/media/3gNpf0QW2Ms9W5Uk8M/giphy.gif"/>
</p>

###### Modo "Drone"

O modo "Drone" simula uma liberdade de movimento maior, como um drone voando sobre o modelo Sponza. A implementação desse modo é feita com o controlador [First Person](https://threejs.org/docs/#examples/en/controls/FirstPersonControls) que é uma variação do controlador Fly e funcionou bem para este modo. Conquanto aos controles são bem simples, o clique do mouse esquerdo move a câmera na direção observada e o direito para direção contrária, após clicar com o mouse há a liberação do teclado, onde WASD movem também a câmera. As informações de movimento mais detalhadas encontram-se no menu informacional superior. Conquanto a configuração, a velocidade do movimento é definida em 150 e a lookSpeed em 0.1. Uma visão do modo "Drone":

<p align="center">
<img src="https://media.giphy.com/media/TjNVYu2qhdyjTcPxx4/giphy.gif"/>
</p>

###### Modo "Visita Guiada"

O modo "Visita Guiada" simula um passeio fixo sobre o modelo, passando por 4 posições pré-definidas e permitindo o usuário olhar ao redor em certos momentos. Conquanto a implementação também foi utilizado o controlador [Pointer Lock](https://threejs.org/docs/#examples/en/controls/PointerLockControls), com o "Lock" e o "Unlock" sendo utilizados para iniciar e reiniciar a visita. Nesse modo conhecemos o simpático robô apelidado por mim de [Expressivetron](https://sketchfab.com/3d-models/robot-expressive-190ef77551c14273a9b4145f06f35dc1), que é um robô animado e articulado e carregado pelo [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader). As animações e os movimentos do robô e câmera são definidos por métodos como moveRobotX, moveRobotY, moveRobotZ, robotLookAt, robotAction, moveCameraTourForward, moveCameraTourUp, moveCameraTourRight, entre outros, que se baseiam essencialmente em manipulação de posicionamento de objeto, câmera, todos baseados em início e duração máxima dos movimentos, além da regulação destes com base em uma velocidade e variação do tempo entre os frames. Uma visão do modo "Visita Guiada":

<p align="center">
<img src="https://media.giphy.com/media/EpvVm7qK3qAfiBClhi/giphy-downsized-large.gif"/>
</p>


## :no_entry: Confinamento ao modelo

O cenário do Sponza foi carregado utilizando o [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader), porém este modelo não contempla a zona externa do palácio, por isso foi necessário confinar os movimentos a área interna do modelo. Para o confinamento foi verificado estaticamente, pelos posicionamentos da câmera, aproximadamente quais seriam esses limites de confinamento e na função de render foram colocadas regras que impedem a câmera de avançar. Conquanto a visita guiada não foi necessário tratar confinamento, já que os movimentos são pré-definidos e o usuário não tem liberdade de movimentar a câmera, somente ajustar a visualização em alguns pontos.

## :european_castle: Cubemap background

Por motivos de imersão maior, foi utilizada uma textura em cubemap para simular um ambiente ao redor do modelo. No modo "A pé" so é possível ver o céu, porém no modo "Drone" e "Visita Guiada" é possível ver os arredores. A implementação foi feita utilizando o cubemap texture loader do Three e o cubemap [Fisherman's Bastion](https://www.humus.name/index.php?page=Cubemap&item=FishermansBastion). Uma visão do background:

<p align="center">
<img src="https://media.giphy.com/media/gf4gJgispDhjb9lUIY/giphy-downsized-large.gif"/>
</p>
	
</div>


