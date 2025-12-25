import * as purchaseService from "./purchases.services.js";

export const buyContent = async (req, res) => {
  if (req.identity.type !== "user") {
    return res.status(403).json({
      error: "Login required to buy content"
    });
  }

  const { contentId } = req.params;
  const userId = req.identity.user_id;

  const purchase = await purchaseService.buyContent(
    userId,
    contentId
  );

  res.status(201).json(purchase);
};
