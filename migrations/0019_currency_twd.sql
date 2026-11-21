-- 幣別改為新台幣 TWD(金額單位維持「分」)
UPDATE product_prices SET currency = 'TWD' WHERE currency = 'CNY';
DELETE FROM exchange_rates WHERE currency = 'TWD';
