import { DataTypes, Model } from "sequelize";

class Price extends Model {
  static initModel(sequelize) {
    Price.init(
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
        },
        cryptocurrencyId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Price",
        tableName: "prices",
        timestamps: false,
      }
    );
    return Price;
  }

  static associate(models) {
    // Relación muchos a 1 con Cryptocurrency
    this.belongsTo(models.Cryptocurrency, {
      foreignKey: "cryptocurrencyId",
      as: "cryptocurrency",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }
}

export default Price;