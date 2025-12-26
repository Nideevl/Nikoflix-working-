import * as subscriptionService from "./subscriptions.services.js";

export const getSubscriptions = async (req, res) => {
  try {
    const plans = await subscriptionService.getAllPlans();

    let activeSubscription = null;

    if (req.identity?.type === "user") {
      activeSubscription =
        await subscriptionService.getActiveSubscription(
          req.identity.user_id
        );
    }

    res.json({
      plans,
      active_subscription: activeSubscription
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
};

export const createSubscriptionIntent = async (req, res) => {
  try {
    // 1️⃣ Must be logged in
    if (req.identity.type !== "user") {
      return res.status(401).json({
        error: "Login required to subscribe"
      });
    }

    const userId = req.identity.user_id;
    const { plan_id } = req.body;

    if (!plan_id) {
      return res.status(400).json({
        error: "plan_id is required"
      });
    }

    // 2️⃣ Ensure no active subscription
    const hasActive =
      await subscriptionService.hasActiveSubscription(userId);

    if (hasActive) {
      return res.status(409).json({
        error: "User already has an active subscription"
      });
    }

    // 3️⃣ Fetch plan
    const plan = await subscriptionService.getPlanById(plan_id);

    if (!plan) {
      return res.status(404).json({
        error: "Plan not found"
      });
    }

    // 4️⃣ Create intent (temporary, no DB write yet)
    // Later this becomes Razorpay order creation
    res.json({
      intent: {
        plan_id: plan.plan_id,
        name: plan.name,
        price: plan.price,
        duration_days: plan.duration_days,
        currency: "INR"
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to create subscription intent"
    });
  }
};
