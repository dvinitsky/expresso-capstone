const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.param('menuId', (req, res, next, menuId) => {
  db.get("SELECT * FROM Menu WHERE id = $menuId", { $menuId: menuId }, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      req.menu = row;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});
menusRouter.param('menuItemId', (req, res, next, menuItemId) => {
  db.get("SELECT * FROM MenuItem WHERE id = $menuItemId", { $menuItemId: menuItemId }, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      req.menuItem = row;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});


menusRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Menu", (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({ menus: rows });
    }
  });
});

menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    return res.sendStatus(400);
  }

  db.run("INSERT INTO Menu (title) VALUES ($title)", { $title: title }, function (err) {
    if (err) {
      next(err);
    } else {
      db.get("SELECT * FROM Menu WHERE id = $lastID", { $lastID: this.lastID }, (err, row) => {
        res.status(201).send({ menu: row });
      });
    }
  });
});


menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).send({ menu: req.menu });
});

menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    return res.sendStatus(400);
  }

  db.run("UPDATE Menu SET title = $title", { $title: title }, err => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, row) => {
        res.status(200).send({ menu: row });
      });
    }
  });
});

menusRouter.delete('/:menuId', (req, res, next) => {
  db.all("SELECT * FROM MenuItem", (err, rows) => {
    if (err) {
      next(err);
    } else {
      let hasRelated = false;

      rows.forEach(item => {
        if (item.menu_id == req.params.menuId) {
          hasRelated = true;
        }
      });

      if (hasRelated) {
        return res.sendStatus(400);
      } else {
        db.run("DELETE FROM Menu WHERE id = $menuId", { $menuId: req.params.menuId }, err => {
          res.status(204).send();
        });
      }
    }

  });
});


menusRouter.get('/:menuId/menu-items', (req, res, next) => {
  db.all("SELECT * FROM MenuItem WHERE menu_id = $menuId", { $menuId: req.params.menuId }, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({ menuItems: rows });
    }
  });
});

menusRouter.post('/:menuId/menu-items', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;

  if (!name || !description || !inventory || !price || !menuId) {
    return res.sendStatus(400);
  }

  db.run("INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)", { $name: name, $description: description, $inventory: inventory, $price: price, $menuId: menuId }, function (err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, row) => {
        res.status(201).send({ menuItem: row });
      });
    }
  });
});

menusRouter.put('/:menuId/menu-items/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;

  if (!name || !description || !inventory || !price || !menuId) {
    return res.sendStatus(400);
  }

  db.run("UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $menuItemId", { $name: name, $description: description, $inventory: inventory, $price: price, $menuId: menuId, $menuItemId: req.params.menuItemId }, err => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, row) => {
        res.status(200).send({ menuItem: row });
      });
    }
  });
});

menusRouter.delete('/:menuId/menu-items/:menuItemId', (req, res, next) => {
  db.run("DELETE FROM MenuItem WHERE id = $menuItemId", { $menuItemId: req.params.menuItemId }, err => {
    res.status(204).send();
  });
});


module.exports = menusRouter;