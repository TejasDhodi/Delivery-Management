const Partner = require("../model/Partner");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerPartner = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email, and password are required" });
    }

    const partnerExists = await Partner.findOne({ where: { email } });

    if (partnerExists) {
      const isMatch = await bcryptjs.compare(password, partnerExists.password);

      if (isMatch) {
        const token = jwt.sign(
          {id: partnerExists.id},
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        return res.status(200).json({
          success: true,
          message: "Partner authenticated successfully",
          detailsFilled: partnerExists.detailsFilled,
          token,
        });
      } else {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newPartner = await Partner.create({
      name: "",
      email,
      password: hashedPassword,
      phone: "",
    });

    const token = jwt.sign({ id: newPartner.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      success: true,
      message: "Partner registered successfully",
      detailsFilled: newPartner.detailsFilled,
      token,
    });
  } catch (error) {
    console.error("Registration/Login Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const completeRegistration = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { name, phone } = req.body;

    const partner = await Partner.findByPk(partnerId);

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    partner.name = name || partner.name;
    partner.phone = phone || partner.phone;
    partner.detailsFilled = true;

    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Registration completed successfully",
    });
  } catch (error) {
    console.error("Complete Registration Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}

const getPartnerProfile = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const partner = await Partner.findByPk(partnerId, {
      attributes: { exclude: ["password"] },
    });

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    res.status(200).json({
      success: true,
      message: "Partner profile fetched successfully",
      data: partner,
    });
  } catch (error) {
    console.error("Fetch Profile Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const getPartners = async (req, res) => {
  try {
    const partners = await Partner.findAll();
    return res.status(200).json({
      success: true,
      message: "Partners fetched successfully",
      data: partners,
    });
  } catch (error) {
    console.error("Fetch Partners Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

const updateStatus = async (req, res) => {
  try {
    const partnerId = req.user.id;
    const { status } = req.body;

    const partner = await Partner.findByPk(partnerId);

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    partner.status = status;
    await partner.save();

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: partner,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

const getAvailablePartners = async (req, res) => {
  try {
    const availablePartners = await Partner.findAll({
      where: { status: "available" },
    });
    return res.status(200).json({
      success: true,
      message: "Available partners fetched successfully",
      data: availablePartners,
    });
  } catch (error) {
    console.error("Fetch Available Partners Error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

module.exports = {
  registerPartner,
  getPartnerProfile,
  getPartners,
  updateStatus,
  getAvailablePartners,
  completeRegistration
};
