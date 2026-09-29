import unittest


def calculate_platform_commission(amount: float, commission_rate_pct: float = 5.0) -> dict:
    """Helper representing Syncro financial escrow and payout calculation."""
    if amount < 0:
        raise ValueError("Order amount cannot be negative")
    fee = round(amount * (commission_rate_pct / 100.0), 2)
    seller_payout = round(amount - fee, 2)
    return {
        "gross_amount": amount,
        "platform_fee": fee,
        "seller_payout": seller_payout,
    }


class BusinessLogicTests(unittest.TestCase):
    def test_commission_calculation_exact(self):
        result = calculate_platform_commission(10000.0, 5.0)
        self.assertEqual(result["gross_amount"], 10000.0)
        self.assertEqual(result["platform_fee"], 500.0)
        self.assertEqual(result["seller_payout"], 9500.0)

    def test_commission_calculation_fractional(self):
        result = calculate_platform_commission(1250.75, 5.0)
        self.assertEqual(result["platform_fee"], 62.54)
        self.assertEqual(result["seller_payout"], 1188.21)

    def test_commission_negative_amount_raises_error(self):
        with self.assertRaises(ValueError):
            calculate_platform_commission(-500.0)

    def test_price_negotiation_counter_proposal(self):
        original_price = 15000.0
        proposed_price = 12500.0
        
        # Proposed price must be greater than zero and distinct from original
        self.assertGreater(proposed_price, 0)
        self.assertNotEqual(original_price, proposed_price)
        discount_pct = round(((original_price - proposed_price) / original_price) * 100, 1)
        self.assertEqual(discount_pct, 16.7)


if __name__ == "__main__":
    unittest.main()
