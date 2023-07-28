import db from "./index.js";

export const Category = db.sequelize.define("categories", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },
    parent: {
        type : db.Sequelize.INTEGER,
        allowNull : true
    },
    status: {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue: 1
    }
},
{ timestamps: false }
);

export const Product = db.sequelize.define("products", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },
    price: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
    description: {
        type : db.Sequelize.TEXT('medium'),
        allowNull : false
    },
    image : {
        type : db.Sequelize.TEXT('medium'),
        allowNull : true,
    },
    status : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue: 1
    },
    
},
{ timestamps: false }
)

export const ProductCategories = db.sequelize.define("product_categories", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    productId: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
    categoryId: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
},
{ timestamps: false }
)

export const Role = db.sequelize.define("roles",{
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: db.Sequelize.STRING(45),
        allowNull: false
    }
},
{ timestamps: false }
)

export const Transaction = db.sequelize.define("transactions",{
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    invoice: {
        type: db.Sequelize.STRING(45),
        allowNull : false
    },
    created_at:{
        type: db.Sequelize.TIME
    },
    userId: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
    total_price: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    }
},
{timestamps: false}
)

export const Items = db.sequelize.define("transaction_items",{
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    created_at:{
        type: db.Sequelize.TIME
    },
    transactionId: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
    productId: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
    qty: {
        type: db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue: 1
    },
    total_price: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
},
{timestamps: false}
)

export const User = db.sequelize.define("users", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    username: {
        type: db.Sequelize.STRING(45),
        allowNull: false
    },
    email: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },
    password: {
        type: db.Sequelize.TEXT('long'),
        allowNull : false
    },
    image : {
        type : db.Sequelize.TEXT('long'),
        allowNull : true
    },
    roleId: {
        type: db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue: 0
    },
    status : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue : 1
    }
},
{ timestamps: false }
)

Role.hasMany(User);

User.belongsTo(Role, {foreignKey : 'roleId'});
User.hasMany(Transaction);

Transaction.belongsTo(User, {foreignKey : 'userId'});
Transaction.hasMany(Items);

Items.belongsTo(Transaction, {foreignKey : 'transactionId'});
Items.belongsTo(Product, {foreignKey : 'productId'});

Product.hasMany(Items);

Product.belongsToMany(Category, { through : ProductCategories, foreignKey : 'productId' });
Category.belongsToMany(Product, {through : ProductCategories, foreignKey : 'categoryId'});
Product.hasMany(ProductCategories,{ as : 'productCategory' });
ProductCategories.belongsTo(Product);
Category.hasMany(ProductCategories,{ as : 'categoryProduct' });
ProductCategories.belongsTo(Category);

Category.hasMany(Category, {as : 'sub_category', foreignKey : 'parent'});