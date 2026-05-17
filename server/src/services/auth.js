const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config');

class AuthService {
  async register(email, password, role) {
    const existing = await User.findByEmail(email);
    if (existing) throw Object.assign(new Error('邮箱已注册'), { status: 409 });

    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await User.create({ email, password_hash, role });
    const token = this._generateToken(user);
    return { user, token };
  }

  async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) throw Object.assign(new Error('邮箱或密码错误'), { status: 401 });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw Object.assign(new Error('邮箱或密码错误'), { status: 401 });

    const { password_hash, ...safeUser } = user;
    const token = this._generateToken(safeUser);
    return { user: safeUser, token };
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) throw Object.assign(new Error('用户不存在'), { status: 404 });
    return user;
  }

  _generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

module.exports = new AuthService();
