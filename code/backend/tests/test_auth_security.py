import unittest
import jwt
from datetime import timedelta
from app.core.security import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM


def is_admin_email(email: str) -> bool:
    admin_emails = ["syncromarketplace@gmail.com"]
    if not email:
        return False
    return email.strip().lower() in admin_emails


class AuthSecurityTests(unittest.TestCase):
    def test_password_hashing_and_verification(self):
        plain_password = "SecurePassword@2026"
        hashed = get_password_hash(plain_password)
        
        # Hash should not equal plain password
        self.assertNotEqual(plain_password, hashed)
        # Verification succeeds with correct password
        self.assertTrue(verify_password(plain_password, hashed))
        # Verification fails with incorrect password
        self.assertFalse(verify_password("WrongPassword123", hashed))

    def test_jwt_token_creation_and_payload(self):
        test_email = "student@eng.pdn.ac.lk"
        token = create_access_token(data={"sub": test_email}, expires_delta=timedelta(minutes=15))
        
        self.assertIsInstance(token, str)
        # Decode and verify payload
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        self.assertEqual(payload.get("sub"), test_email)
        self.assertIn("exp", payload)

    def test_is_admin_email_validation(self):
        # Default platform administrator
        self.assertTrue(is_admin_email("syncromarketplace@gmail.com"))
        self.assertTrue(is_admin_email("SYNCROMARKETPLACE@GMAIL.COM"))  # Case-insensitive
        
        # Regular users should never be recognized as admin
        self.assertFalse(is_admin_email("buyer@gmail.com"))
        self.assertFalse(is_admin_email("seller@gmail.com"))
        self.assertFalse(is_admin_email(""))


if __name__ == "__main__":
    unittest.main()
