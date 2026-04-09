package sync2.chatApp.service;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthGetTransactionCount;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.http.HttpService;
import org.web3j.utils.Numeric;

@Service
public class Web3jService {

	@Value("${web3.rpc.url}")
	private String rpcUrl;

	@Value("${web3.private.key}")
	private String privateKey;

	@Value("${web3.contract.address}")
	private String contractAddress;

	public String storeBundleOnChain(String cid, String bundleHash) throws Exception {
		Web3j web3j = Web3j.build(new HttpService(rpcUrl));
		Credentials credentials = Credentials.create(privateKey);

		Function function = new Function("storeBundle",
				Arrays.asList(new org.web3j.abi.datatypes.generated.Uint256(System.currentTimeMillis() / 1000),
						new org.web3j.abi.datatypes.Utf8String(cid),
						new org.web3j.abi.datatypes.Utf8String(bundleHash)),
				Collections.emptyList());

		String encodedFunction = FunctionEncoder.encode(function);

		EthGetTransactionCount ethGetTransactionCount = web3j
				.ethGetTransactionCount(credentials.getAddress(), DefaultBlockParameterName.LATEST).sendAsync().get();
		BigInteger nonce = ethGetTransactionCount.getTransactionCount();

		BigInteger gasLimit = BigInteger.valueOf(200000);
		BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();

		RawTransaction rawTransaction = RawTransaction.createTransaction(nonce, gasPrice, gasLimit, contractAddress,
				encodedFunction);

		byte[] signedMessage = TransactionEncoder.signMessage(rawTransaction, 84532L, credentials);
		String hexValue = Numeric.toHexString(signedMessage);

		EthSendTransaction ethSendTransaction = web3j.ethSendRawTransaction(hexValue).send();

		if (ethSendTransaction.hasError()) {
			throw new RuntimeException("Gagal kirim ke Base: " + ethSendTransaction.getError().getMessage());
		}

		return ethSendTransaction.getTransactionHash();
	}
}