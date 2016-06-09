# Tokens Sequelize plugin

This plugin allows to quickly attach tokens to any Sequelize model

## Install

```
npm install sequelize-tokens
```

and then attach the plugin:

```javascript
require('sequelize-tokens)(Sequelize);
```

## Usage

Declare token in model definition options:

```javascript
sequelize.define('Model', attributes, {
		// ... other options
		useTokens: { typeA: true, typeB: true }
});
```

Such a definition gives to Model and each its instances the following superpowers:

 * associations ```typeAToken```, ```typeBToken```, ...

	This allows to fetch the token (of any type) along with fething the entity itself:

	```javascript
	Model.find({include: [{ association: Model.associations.typeAToken }]});
	```

 * instance methods ```instance.createTypeAToken()```, ```instance.getTypeAToken()``` and ```instance.setTypeAToken({...})```


