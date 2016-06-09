'use strict';

/**
 * Tokens Sequelize plugin
 *
 * This plugin allows to quickly attach tokens to any Sequelize model
 *
 * = Usage =
 *
 * Declare token in model definition options:
 *
 * <code>
 *     sequelize.define('Model', attributes, {
 *     		// ... other options
 *     		useTokens: { typeA: true, typeB: true }
 *     });
 * </code>
 *
 * Such a definition gives to Model and each its instances the following superpowers:
 *
 * 		o associations Model.associations.typeAToken, Model.associations.typeBToken, ...
 *
 * 		  This allows to fetch the token (of any type) along with fething the entity itself:
 *
 * 		  	Model.find({include: [{ association: Model.associations.typeAToken }]});
 *
 * 		o instance methods instance.createTypeAToken(), instance.getTypeAToken() and
 * 	      instance.setTypeAToken({...})
 */

/**
 *
 * @param {Sequelize} Sequelize
 */
module.exports = function (Sequelize) {
	const _ = Sequelize.Utils._;

	function attachTokens(options, sequelize) {
		if (!options.useTokens) {
			return;
		}

		const Token = sequelize.import('./lib/token.model.js');

		let originalAssociate = options.classMethods.associate || function () {};

		_.extend(options.classMethods, {
			associate: function () {
				let self = this;

				_.each(options.useTokens, function (options, type) {

					if (typeof options !== 'object') {
						options = {};
					}

					let associationAs = type.charAt(0).toLowerCase() + type.slice(1) + 'Token';

					self.hasOne(Token, {
						as: associationAs,
						foreignKey: 'foreignKey',
						where: {
							type: self.name + '.' + type + 'Token'
						},
						required: false,
						constraints: false
					});

					// Decorate set{Type}Token() and create{Type}Token() injected by hasOne association, in order to provide
					// meaningful defaults

					let association = self.associations[associationAs];

					['set', 'create']
						.filter(function (op) {
							return typeof self.Instance.prototype[association.accessors[op]] === 'function';
						})
						.forEach(function (op) {
							let original =	self.Instance.prototype[association.accessors[op]];

							self.Instance.prototype[association.accessors[op]] = function () {
								let args = Array.prototype.slice.call(arguments);

								if (args.length === 0) {
									args.push({});
								}

								args[0] = _.extend(options, args[0], {
									type: self.name + '.' + type + 'Token'
								});

								return original.apply(this, args);
							}
						});
				});

				return originalAssociate.apply(this, arguments);
			}
		});
	}

	Sequelize.addHook('afterInit', function(sequelize) {
		sequelize.addHook('beforeDefine', function (attributes, options) {
			attachTokens(options, sequelize);
		});
	});
};