'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;

      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      };

      const validation = solver.validate(puzzle);
      if (!validation.valid) {
        return res.json({ error: validation.error });
      };
      const row = coordinate.charAt(0);
      const column = coordinate.charAt(1);

      if (!/^[A-I][1-9]$/.test(coordinate)) {
        return res.json({ error: 'Invalid coordinate' });
      };

      if (!/^[1-9]$/.test(value)) {
        return res.json({ error: 'Invalid value' });
      };

      const index = (solver.letterToNumber(row) - 1) * 9 + (parseInt(column, 10) - 1);

      if (puzzle[index] === value) {
        return res.json({ valid: true });
      };

      const validRow = solver.checkRowPlacement(puzzle, row, column, value);
      const validColumn = solver.checkColPlacement(puzzle, row, column, value);
      const validRegion = solver.checkRegionPlacement(puzzle, row, column, value);
      const conflicts = [];
      if (!validRow) conflicts.push('row');
      if (!validColumn) conflicts.push('column');
      if (!validRegion) conflicts.push('region');

      if (conflicts.length > 0) {
        res.json({ valid: false, conflict: conflicts });
      } else {
        res.json({ valid: true });
      };
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;

      if (!puzzle) {
        return res.json({ error: 'Required field missing' });
      };

      const validation = solver.validate(puzzle);
      if (!validation.valid) {
        return res.json({ error: validation.error });
      };

      const solution = solver.solve(puzzle);
      if (solution) {
        res.json({ solution });
      } else {
        res.json({ error: 'Puzzle cannot be solved' });
      };
    });
};
