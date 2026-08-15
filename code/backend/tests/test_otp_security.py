import hashlib
import unittest

from app.utils.otp import generate_otp, hash_otp, verify_otp_hash


class OtpSecurityTests(unittest.TestCase):
    def test_generate_otp_is_six_digits(self):
        otp = generate_otp()
        self.assertIsInstance(otp, str)
        self.assertEqual(len(otp), 6)
        self.assertTrue(otp.isdigit())

    def test_hash_and_verify_otp(self):
        otp = "123456"
        stored_hash = hash_otp(otp)
        self.assertEqual(len(stored_hash), 64)
        self.assertTrue(verify_otp_hash(otp, stored_hash))
        self.assertFalse(verify_otp_hash("654321", stored_hash))

    def test_hash_is_not_plaintext(self):
        otp = "123456"
        stored_hash = hash_otp(otp)
        self.assertNotEqual(stored_hash, otp)
        self.assertEqual(len(stored_hash), 64)


if __name__ == "__main__":
    unittest.main()
