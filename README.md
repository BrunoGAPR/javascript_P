Usando como base o projeto desenvolvido no Exercício 02, reimplemente todas as funcionalidades usando agora o Webservice REST para o IMC presente no seguinte link: https://ifsp.ddns.net/webservices/imc/

Lembre-se que o front-end deve sempre refletir os dados presentes no backend. Por exemplo, se realizar o cadastro de uma nova pessoa, não basta exibir a pessoa no HTML/front-end. É necessário que tal pessoa tenha sido adicionada no back-end!

Alguns detalhes:

O cálculo do IMC e do status é feito exclusivamente pelo backend. O front-end apenas "obedece" e exibe as informações necessárias.
Lembre-se que aumentar ou diminuir o peso deve sempre aumentar/reduzir o peso em até 0.5 Kg por cada iteração.
Faça o tratamento adequado das respostas do backend. Por exemplo, se for editar o peso de uma pessoa, só altere o peso no front-end se o back-end confirmar que a alteração aconteceu mesmo (isso vale para TODAS as operações).
O seu código não deve quebrar ou recarregar a página em nenhuma hipótese (por exemplo, não pode recarregar a página depois de adicionar/editar/remover uma pessoa!).
Caso queira uma inspiração, segue um exemplo desenvolvido: https://ifsp.ddns.net/react/imc
