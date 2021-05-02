## README.md
Le protocole Solipays est né d'une volonté de mettre les mécanismes de finance décentralisé au service du grand public et des associations humanitaires œuvrant pour le bien de notre planète.
Les épargnants pourront déposer des fonds sur des produits d'épargnes sécurisés et rémunérateurs. Ces produits d'épargne rémunèrent ces derniers tout en alimentant un fond de financement solidaire.

Ce fond servira à financer des projets humanitaires au travers de votes de la communauté épargnants et donatrice.

------ installation en local --------

- Clonez Solipay avec la commande: git clone https://github.com/0xSaitama/Solipay

- Installez les dépendances avec la commande : npm i
  vous devrez modifier la version de pragma solidity
  dans la dépendance @uniswap/v2-periphery/libraries/SafeMath.sol en 0.6.11

- deployez les contrats avec la commande : truffle migrate --network kovan

- lancer la web APP depuis le client avec la commande : npm start
  __________________________________

  ENJOY
