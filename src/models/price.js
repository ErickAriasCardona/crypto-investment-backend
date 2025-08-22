const { DataTypes, Model } = require('sequelize');
const Cryptocurrency = require('./cryptocurrency');

class Price extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        price_usd: {
          type: DataTypes.DECIMAL(18, 8),
          allowNull: false,
        },
        volume_24h: {
          type: DataTypes.DECIMAL(18, 2),
          allowNull: true,
        },
        percent_change_24h: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        date_time: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        }
      },
      {
        sequelize,
        tableName: "prices",
        timestamps: false,
      }
    );
  }

  static associate() {
    // Relación muchos a 1 con Cryptocurrency
    this.belongsTo(Cryptocurrency, {
      foreignKey: "cryptocurrencyId",
      as: "cryptocurrencies",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }
}

module.exports = Price;