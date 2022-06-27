const { expect, ether } = require("@1inch/solidity-utils");
const { web3 } = require("hardhat");

const ArgumentsDecoderTest = artifacts.require('ArgumentsDecoderTest');

describe('SolidityTests', async function () {
    describe('ArgumentsDecoderTest', async function () {
        before(async () => {
            [this.account] = await web3.eth.getAccounts();

            this.offset = 12;
            this.uint256Data = web3.eth.abi.encodeParameter('uint256', ether('1234'));
            this.uint256DataWithOffset = this.uint256Data + web3.eth.abi.encodeParameter('uint256', ether('5678')).slice(-this.offset*2);
            this.selectorData = web3.eth.abi.encodeFunctionSignature('test(uint256,string)');
            this.selectorDataWithOffset = '0x' + this.uint256Data.slice(-this.offset*2) + web3.eth.abi.encodeFunctionSignature('test(uint256,string)').slice(2);
            this.boolData = web3.eth.abi.encodeParameter('bool', true);
        });

        beforeEach(async () => {
            this.argumentsDecoderTest = await ArgumentsDecoderTest.new();
        });

        it('testDecodeBool', async () => {
            await this.argumentsDecoderTest.testDecodeBool();
        });

        it('testDecodeUint', async () => {
            await this.argumentsDecoderTest.testDecodeUint();
        });

        describe('testDecodeUint256Memory', async () => {
            it('should decode', async () => {
                await this.argumentsDecoderTest.testDecodeUint256Memory(this.uint256Data);
            });

            it('should not decode with incorrect data length', async () => {
                await expect(
                    this.argumentsDecoderTest.testDecodeUint256Memory(this.uint256Data.slice(0, -2)),
                ).to.eventually.be.rejectedWith('IncorrectDataLength()');
            });

            it.skip('should be cheaper than standart method', async () => {
                // TODO: remove method from lib
                const result = await this.argumentsDecoderTest.testUint256MemoryGas(this.uint256Data);
                expect(result.gasLib).to.be.bignumber.lt(result.gasAbiDecode);
            });
        });

        describe('testDecodeUint256', async () => {
            it('should decode', async () => {
                await this.argumentsDecoderTest.testDecodeUint256(this.uint256Data);
            });

            it('should not decode with incorrect data length', async () => {
                await expect(
                    this.argumentsDecoderTest.testDecodeUint256(this.uint256Data.slice(0, -2)),
                ).to.eventually.be.rejectedWith('IncorrectDataLength()');
            });

            it.skip('should be cheaper than standart method', async () => {
                // TODO: remove method from lib
                const result = await this.argumentsDecoderTest.testUint256CalldataGas(this.uint256Data);
                expect(result.gasLib).to.be.bignumber.lt(result.gasAbiDecode);
            });
        });

        describe('testDecodeUint256 with offset', async () => {
            it('should decode while data length and offset correct', async () => {
                for (let i = 0; i < this.offset; i++) {
                    await this.argumentsDecoderTest.testDecodeUint256(this.uint256DataWithOffset, i);
                }
                await expect(
                    this.argumentsDecoderTest.testDecodeUint256(this.uint256DataWithOffset, this.offset+1),
                ).to.eventually.be.rejectedWith('IncorrectDataLength()');
            });

            it('should be cheaper than standart method', async () => {
                const result = await this.argumentsDecoderTest.testUint256CalldataOffsetGas(this.uint256DataWithOffset, this.offset);
                expect(result.gasLib).to.be.bignumber.lt(result.gasAbiDecode);
            });
        });

        describe('testDecodeSelector', async () => {
            it('should decode', async () => {
                await this.argumentsDecoderTest.testDecodeSelector(this.selectorData);
            });

            it('should not decode with incorrect data length', async () => {
                await expect(
                    this.argumentsDecoderTest.testDecodeSelector(this.selectorData.slice(0, -2)),
                ).to.eventually.be.rejectedWith('IncorrectDataLength()');
            });

            it('should be cheaper than standart method', async () => {
                const result = await this.argumentsDecoderTest.testSelectorGas(this.selectorData);
                expect(result.gasLib).to.be.bignumber.lt(result.gasAbiDecode);
            });
        });

        describe('testDecodeSelector with offset', async () => {
            it('should decode while data length and offset correct', async () => {
                // TODO: remove .contract.methods + .call()
                for (let i = 0; i < this.offset; i++) {
                    await this.argumentsDecoderTest.contract.methods.testDecodeSelector(this.selectorDataWithOffset, i).call();
                }
                await expect(
                    this.argumentsDecoderTest.contract.methods.testDecodeSelector(this.selectorDataWithOffset, this.offset+1).call(),
                ).to.eventually.be.rejectedWith('IncorrectDataLength()');
            });

            it('should be cheaper than standart method', async () => {
                // TODO: remove .contract.methods + .call()
                const result = await this.argumentsDecoderTest.testSelectorOffsetGas(this.selectorDataWithOffset, this.offset);
                expect(result.gasLib).to.be.bignumber.lt(result.gasAbiDecode);
            });
        });

        describe('testDecodeBoolMemory', async () => {
            it('should decode', async () => {
                await this.argumentsDecoderTest.testDecodeBoolMemory(this.boolData);
            });

            it('should not decode with incorrect data length', async () => {
                await expect(
                    this.argumentsDecoderTest.testDecodeBoolMemory(this.boolData.slice(0, -2)),
                ).to.eventually.be.rejectedWith('IncorrectDataLength()');
            });

            it.skip('should be cheaper than standart method', async () => {
                // TODO: remove method from lib
                const result = await this.argumentsDecoderTest.testBoolMemoryGas(this.boolData);
                expect(result.gasLib).to.be.bignumber.lt(result.gasAbiDecode);
            });
        });

        describe('testDecodeBool', async () => {
            it('should decode', async () => {
                // TODO: remove .contract.methods + .call()
                await this.argumentsDecoderTest.contract.methods.testDecodeBool(this.boolData).call();
            });

            it('should not decode with incorrect data length', async () => {
                // TODO: remove .contract.methods + .call()
                await expect(
                    this.argumentsDecoderTest.contract.methods.testDecodeBool(this.boolData.slice(0, -2)).call(),
                ).to.eventually.be.rejectedWith('IncorrectDataLength()');
            });

            it.skip('should be cheaper than standart method', async () => {
                // TODO: remove method from lib
                const result = await this.argumentsDecoderTest.testBoolCalldataGas(this.boolData);
                expect(result.gasLib).to.be.bignumber.lt(result.gasAbiDecode);
            });
        });

        describe('testDecodeTailCalldata', async () => {
            it('should decode', async () => {
                await this.argumentsDecoderTest.testDecodeTailCalldata(this.uint256Data, this.offset);
            });

            it('should not decode with incorrect data length', async () => {
                await expect(
                    this.argumentsDecoderTest.testDecodeTailCalldata(this.uint256Data, 33),
                ).to.eventually.be.rejectedWith('IncorrectDataLength()');
            });

            it('should be cheaper than standart method', async () => {
                const result = await this.argumentsDecoderTest.testDecodeTailCalldataGas(this.uint256Data, this.offset);
                expect(result.gasLib).to.be.bignumber.lt(result.gasAbiDecode);
            });
        });

        describe('testDecodeTargetAndCalldata', async () => {
            it('should decode', async () => {
                await this.argumentsDecoderTest.testDecodeTargetAndCalldata(this.uint256Data);
            });

            it('should not decode with incorrect data length', async () => {
                await expect(
                    this.argumentsDecoderTest.testDecodeTargetAndCalldata(this.uint256Data.slice(0, 18*2)),
                ).to.eventually.be.rejectedWith('IncorrectDataLength()');
            });

            it('should be cheaper than standart method', async () => {
                const result = await this.argumentsDecoderTest.testDecodeTargetAndCalldataGas(this.uint256Data);
                expect(result.gasLib).to.be.bignumber.lt(result.gasAbiDecode);
            });
        });
    });
});
