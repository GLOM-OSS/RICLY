import { http } from '@ricly/axios';
import { SubscribeInterface, Subscription } from '@ricly/interfaces';
import { getRandomString } from '@ricly/utils';
import axios from 'axios';
import { HmacSHA512 } from 'crypto-js';
import { v4 as uuid } from 'uuid';

export async function getSubscriptions(school_code: string) {
  const { data } = await http.get<Subscription[]>(`/subscriptions/all`, {
    params: { school_code },
  });
  return data;
}

export async function createBinanceOrder() {
  const timestamp = new Date().getMilliseconds();
  const nonce = getRandomString(32);
  const requestBody = {
    env: {
      terminalType: 'WEB',
    },
    merchantTradeNo: getRandomString(32),
    orderAmount: 0.01,
    currency: 'USDT',
    goods: {
      goodsType: '02',
      goodsCategory: 'Others',
      referenceGoodsId: uuid(),
      goodsName: 'Ricly Subscription',
      goodDetails: 'Time table management engine subscription.',
    },
  };
  const payload = timestamp + '\n' + nonce + '\n' + requestBody + '\n';
  const signature = HmacSHA512(payload, 'SECRET_KEY').toString();
  const { data } = await axios.post(
    `https://bpay.binanceapi.com/openapi/v2/order`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        'BinancePay-Timestamp': timestamp,
        'BinancePay-Nonce': nonce,
        'BinancePay-Certificate-SN': 'API_KEY',
        'BinancePay-Signature': signature,
      },
    }
  );
  return data;
}

export async function saveSubscription(newSubscription: SubscribeInterface) {
  return http.post(`/subscriptions/new`, newSubscription);
}
