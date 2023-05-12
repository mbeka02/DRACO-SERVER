import axios from "axios";
//make payouts to tutors business to client transactions
const makePayout = async (amount, recipientphone) => {
  const data = await axios.post(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      InitiatorName: "testapi",
      SecurityCredential:
        "SArsZAsZhEXUD2K47BXiCQkvi4T9R86P4XO0zZJ/ELrM3+jdpsGRgiJurWxk2a3P36BnScD91Fov2vgRLyR704Xu0q47ylWvzdtZ44lV7Vocki6hMrRoF2MtDi8DU9DwmrogdGQ/UUR7QYbfoESd/FWIuWutRloa5Dhnn/sZgRNhTAiyHnYGrUhyciWd7SMMeo71/oVc6BA2hBtMcylNyYZXHjUARvYTaV0zmcft/0SuIqeW1Z4ffOrW6Rj1PjXHYuWOI6CSZik5YS7C68JMYTgYV0syRL26DWAP6VkjpZ8lkQ4+cOcKtRflmPFm7PWhRtARTMz7tvf4WuIKd96q3w==",
      CommandID: "BusinessPayment",
      Amount: 1,
      PartyA: 600983,
      //phone number of recipient
      PartyB: 254708374149,
      Remarks: "Test remarks",
      QueueTimeOutURL: "https://mydomain.com/b2c/queue",
      ResultURL: "https://mydomain.com/b2c/result",
      Occassion: "",
    },
    {
      headers: {
        Authorization: `Bearer `,
      },
    }
  );
};

export { makePayout };
