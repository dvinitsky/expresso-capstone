const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  db.get("SELECT * FROM Employee WHERE id = $employeeId", { $employeeId: employeeId }, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      req.employee = row;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get("SELECT * FROM Timesheet WHERE id = $timesheetId", { $timesheetId: timesheetId }, (err, row) => {
    if (err) {
      next(err);
    } else if (row) {
      req.timesheet = row;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});


employeesRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({ employees: rows });
    }
  });
});

employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1

  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }

  db.run("INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)", { $name: name, $position: position, $wage: wage, $isCurrentEmployee: isCurrentEmployee }, function (err) {
    if (err) {
      next(err);
    } else {
      db.get("SELECT * FROM Employee WHERE id = $lastID", { $lastID: this.lastID }, (err, row) => {
        res.status(201).send({ employee: row });
      });
    }
  });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).send({ employee: req.employee });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;

  if (!name || !position || !wage) {
    return res.sendStatus(400);
  }

  db.run("UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $employeeId", { $name: name, $position: position, $wage: wage, $isCurrentEmployee: isCurrentEmployee, $employeeId: req.params.employeeId }, err => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, row) => {
        res.status(200).send({ employee: row });
      });
    }
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run("UPDATE Employee SET is_current_employee = 0", err => {
    if (err) {
      next(err);
    } else {
      db.get("SELECT * FROM Employee WHERE id = $employeeId", { $employeeId: req.params.employeeId }, (err, row) => {
        res.status(200).send({ employee: row });
      });
    }
  });
});

employeesRouter.get('/:employeeId/timesheets', (req, res, next) => {
  db.all("SELECT * FROM Timesheet WHERE employee_id = $employeeId", { $employeeId: req.params.employeeId }, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send({ timesheets: rows });
    }
  });
});

employeesRouter.post('/:employeeId/timesheets', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.body.timesheet.employeeId;

  if (!hours || !rate || !date || !employeeId) {
    return res.sendStatus(400);
  }

  db.run("INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)", { $hours: hours, $rate: rate, $date: date, $employeeId: employeeId }, function (err) {
    if (err) {
      next(err);
    } else {
      db.get("SELECT * FROM Timesheet WHERE id = $lastID", { $lastID: this.lastID }, (err, row) => {
        res.status(200).send({ timesheet: row });
      });
    }
  });

});


employeesRouter.put('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;

  if (!hours || !rate || !date) {
    return res.sendStatus(400);
  }

  db.run("UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $timesheetId", { $hours: hours, $rate: rate, $date: date, $employeeId: employeeId, $timesheetId: req.params.timesheetId }, err => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, row) => {
        res.status(200).send({ timesheet: row });
      });
    }
  });
});

employeesRouter.delete('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
  db.run("DELETE FROM Timesheet WHERE id = $timesheetId", { $timesheetId: req.params.timesheetId }, err => {
    res.status(204).send();
  });
});


module.exports = employeesRouter;