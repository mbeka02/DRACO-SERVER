//creates object that acts as the payload for the jwt

const createTokenUser = (user) => {
  return { name: user.name, userId: user._id, role: user.role };
};

export default createTokenUser;
