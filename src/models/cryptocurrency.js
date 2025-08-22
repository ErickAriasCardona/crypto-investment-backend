const { DataTypes, Model } = require('sequelize');

class Cryptocurrency extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        symbol: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        slug: {
          type: DataTypes.STRING,
          allowNull: false
        },
      },
      {
        sequelize,
        tableName: "cryptocurrencies",
        timestamps: false,
      }
    );
  }

  static associate(models) {
    // Relación 1 a muchos con Price
    this.hasMany(models.Price, {
      foreignKey: "cryptocurrencyId",
      as: "prices",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }
}

module.exports = Cryptocurrency;