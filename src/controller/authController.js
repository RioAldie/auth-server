import prisma from '../app/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import redis from '../app/redisClient.js';

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.SECRET_KEY,
    { expiresIn: '20h' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.SECRET_KEY,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        email: true,
        password: true,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: 'email or Password wrong!' });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: 'email or Password wrong!' });
    }
    const { accessToken, refreshToken } = generateTokens(user);

    await redis.set(`refreshToken:${user.id}`, refreshToken, {
      ex: 7 * 24 * 60 * 60,
    });

    res.status(200).json({
      data: {
        accessToken,
        refreshToken,
        user: {
          email: user.email,
        },
      },
    });
  } catch (e) {
    res.status(500).json({ message: `Server error ${e.message}` });
  }
};
const refreshTokenHandler = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET
    );
    const storedToken = await redis.get(`refreshToken:${decoded.id}`);

    if (!storedToken || storedToken !== refreshToken) {
      return res
        .status(403)
        .json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.SECRET_KEY,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};
const logout = async (req, res) => {
  const userId = req.user.id; 

  await redis.del(`refreshToken:${userId}`);

  res.json({ message: 'Logged out successfully' });
};

export default { login, logout, refreshTokenHandler };
