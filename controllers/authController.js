const User = require("../models/Users");
const Client = require("../models/Clients");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRoles = ["user"];
const clientRoles = ["client"];
const accessTokenDuration = "1d";
const refreshTokenDuration = "1d";

const createAccessToken = (user, roles, duration) => {
  return jwt.sign(
    {
      UserInfo: {
        email: user.email,
        roles: roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: duration }
  );
};

const createRefreshToken = (user, duration) => {
  return jwt.sign({ email: user.email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: duration,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "An email and a password must be provided",
    });
  }

  const foundUser = await User.findOne({ email }).exec();
  const foundClient = await Client.findOne({ email }).exec();

  if (!foundClient && !foundUser) {
    return res.status(401).json({
      message: `Unauthorized`,
    });
  } else if (foundUser && !foundClient) {
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      return res.status(401).json({
        message: `Unauthorized`,
      });
    }

    const accessToken = createAccessToken(
      foundUser,
      userRoles,
      accessTokenDuration
    );
    const refreshToken = createRefreshToken(foundUser, refreshTokenDuration);
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } else if (foundClient && !foundUser) {
    const match = await bcrypt.compare(password, foundClient.password);
    if (!match) {
      return res.status(401).json({
        message: `Unauthorized`,
      });
    }
    const accessToken = createAccessToken(
      foundClient,
      clientRoles,
      accessTokenDuration
    );
    const refreshToken = createRefreshToken(foundClient, refreshTokenDuration);
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } else {
    return res.status(500).json({
      message: `Server error - same email ${email} used for a client and a user`,
    });
  }
};

const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.status(401).json({
      message: "Unauthorized - no cookies",
    });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        res.status(403).json({
          message: "Forbiddenlols",
        });
      }

      const foundUser = await User.findOne({ email: decoded.email }).exec();
      const foundClient = await Client.findOne({ email: decoded.email }).exec();

      if (!foundUser && !foundClient) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      } else if (foundUser && !foundClient) {
        const accessToken = createAccessToken(
          foundUser,
          userRoles,
          accessTokenDuration
        );
        return res.json({ accessToken });
      } else if (!foundUser && foundClient) {
        const accessToken = createAccessToken(
          foundClient,
          clientRoles,
          accessTokenDuration
        );
        return res.json({ accessToken });
      } else {
        return res.status(500).json({
          message: `Server error - same email ${decoded.email} used for a user and a client`,
        });
      }
    }
  );
};

const logout = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(202).json({
      message: "No JWT Cookie found",
    });
  }

  // const refreshToken = cookies.jwt;
  // const foundUser = await User.findOne({refreshToken}).exec();
  // const foundClient = await Client.findOne({refreshToken}).exec();

  // if(!foundUser && !foundClient){
  //     res.clearCookie('jwt', {
  //         httpOnly: true,
  //         sameSite: 'None',
  //         secure: true
  //     })
  //     return res.sendStatus(204);
  // }
  // else if(foundUser && !foundClient){
  //     foundUser.refreshToken = "";
  //     await foundUser.save();
  // }
  // else if(!foundUser && foundClient){
  //     foundClient.refreshToken = "";
  //     await foundClient.save();
  // }

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });
  return res.status(202).json({ message: "Cookie cleared!" });
};

module.exports = {
  login,
  logout,
  refresh,
};
