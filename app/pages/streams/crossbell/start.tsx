import { Box, Typography } from "@mui/material";
import axios from "axios";
import FormikHelper from "components/helper/FormikHelper";
import Layout from "components/layout";
import {
  ExtraLargeLoadingButton,
  FullWidthSkeleton,
  LargeLoadingButton,
  WidgetBox,
  WidgetInputTextField,
  WidgetTitle,
} from "components/styled";
import { CROSSBELL } from "constants/crossbell";
import { crossbellEntryContract } from "contracts/abi/crossbellEntryContract";
import CrossbellChallengeEntity from "entities/CrossbellChallengeEntity";
import CrossbellNoteUriDataEntity from "entities/uri/CrossbellNoteUriDataEntity";
import { BigNumber, ethers } from "ethers";
import { Formik, Form } from "formik";
import useError from "hooks/useError";
import useIpfs from "hooks/useIpfs";
import useToasts from "hooks/useToast";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { palette } from "theme/palette";
import { chainToSupportedChainId } from "utils/chains";
import { stringToAddress } from "utils/converters";
import {
  getLastCrossbellChallenge,
  getPrimaryCrossbellCharacterIdByAddress,
} from "utils/crossbell";
import {
  useAccount,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import * as yup from "yup";

/**
 * Page for start a crossbell stream.
 */
export default function StartCrossbellStream() {
  const { address } = useAccount();
  const { handleError } = useError();
  const [characterId, setCharacterId] = useState<number | null | undefined>();
  const [challenge, setChallenge] = useState<
    CrossbellChallengeEntity | null | undefined
  >();

  useEffect(() => {
    getPrimaryCrossbellCharacterIdByAddress(address)
      .then((characterId) => setCharacterId(characterId))
      .catch((error) => handleError(error, true));
  }, [address]);

  useEffect(() => {
    getLastCrossbellChallenge()
      .then((challenge) => setChallenge(challenge))
      .catch((error) => handleError(error, true));
  }, []);

  return (
    <Layout maxWidth="md">
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" fontWeight={700} textAlign="center">
          🚀 Start stream
        </Typography>
        {characterId !== undefined && challenge ? (
          characterId ? (
            <StartCrossbellStreamForm
              characterId={characterId}
              challenge={challenge}
            />
          ) : (
            <StartCrossbellStreamRequireCharacter />
          )
        ) : (
          <FullWidthSkeleton sx={{ mt: 1 }} />
        )}
      </Box>
    </Layout>
  );
}

function StartCrossbellStreamRequireCharacter() {
  return (
    <>
      <Typography color="text.secondary" textAlign="center" mt={1}>
        is not available right now, you first need to create a character on
        Crossbell
      </Typography>
      <LargeLoadingButton
        href="https://crossbell.io/wallet/characters"
        target="_blank"
        variant="outlined"
        sx={{ mt: 2 }}
      >
        Create character
      </LargeLoadingButton>
    </>
  );
}

function StartCrossbellStreamForm(props: {
  characterId: number;
  challenge: CrossbellChallengeEntity;
}) {
  const { push } = useRouter();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { handleError } = useError();
  const { showToastSuccess, showToastError } = useToasts();
  const { uploadJsonToIpfs } = useIpfs();
  const [streamRoomId, setStreamRoomId] = useState<string | undefined>();

  // Form states
  const [formValues, setFormValues] = useState({
    description: "Participating in the hackathon",
  });
  const formValidationSchema = yup.object({
    description: yup.string().required(),
  });

  // Uploaded data states
  const [uploadedCrossbellNoteDataUri, setUploadedCrossbellNoteDataUri] =
    useState("");
  const [isDataUploading, setIsDataUploading] = useState(false);

  // Contract states
  const { config: contractPrepareConfig, isError: isContractPrepareError } =
    usePrepareContractWrite({
      address: stringToAddress(CROSSBELL.entryContractAddress),
      abi: crossbellEntryContract,
      functionName: "postNote4Note",
      args: [
        {
          characterId: BigNumber.from(props.characterId),
          contentUri: uploadedCrossbellNoteDataUri,
          linkModule: ethers.constants.AddressZero,
          linkModuleInitData: ethers.constants.AddressZero,
          mintModule: ethers.constants.AddressZero,
          mintModuleInitData: ethers.constants.AddressZero,
          locked: false,
        },
        {
          characterId: BigNumber.from(CROSSBELL.challengeAuthorCharacterId),
          noteId: BigNumber.from(props.challenge.id),
        },
      ],
      chainId: chainToSupportedChainId(chain),
      enabled: streamRoomId !== undefined,
      onError(error: any) {
        showToastError(error);
      },
    });
  const {
    data: contractWriteData,
    isLoading: isContractWriteLoading,
    write: contractWrite,
  } = useContractWrite(contractPrepareConfig);
  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransaction({
      hash: contractWriteData?.hash,
    });

  // Form states
  const isFormLoading =
    isDataUploading || isContractWriteLoading || isTransactionLoading;
  const isFormDisabled = isFormLoading || isTransactionSuccess;
  const isFormSubmitButtonDisabled =
    isFormDisabled || isContractPrepareError || !contractWrite;

  async function uploadData(values: any) {
    try {
      setIsDataUploading(true);
      const streamUrl = `https://stream-challenges-app.vercel.app/streams/crossbell/${streamRoomId}`;
      const noteData: CrossbellNoteUriDataEntity = {
        tags: ["stream-challenges-app.vercel.app"],
        type: "note",
        content:
          `I started the stream \"${values.description}\"` +
          `, please [**join**](${streamUrl}) 🚀`,
        external_urls: [streamUrl],
        sources: ["stream-challenges-app.vercel.app"],
      };
      const { uri: noteDataUri } = await uploadJsonToIpfs(noteData);
      setUploadedCrossbellNoteDataUri(noteDataUri);
    } catch (error: any) {
      handleError(error, true);
      setIsDataUploading(false);
    }
  }

  // Create room
  useEffect(() => {
    axios
      .post("/api/streams/rooms/create")
      .then((response) => setStreamRoomId(response.data.data.roomId))
      .catch((error) => console.error(error));
  }, []);

  // Write data to contract if data is uploaded and contract is ready.
  useEffect(() => {
    if (
      uploadedCrossbellNoteDataUri !== "" &&
      contractWrite &&
      !isContractWriteLoading
    ) {
      setUploadedCrossbellNoteDataUri("");
      contractWrite?.();
      setIsDataUploading(false);
    }
  }, [uploadedCrossbellNoteDataUri, contractWrite, isContractWriteLoading]);

  // Handle transaction success
  useEffect(() => {
    if (isTransactionSuccess) {
      showToastSuccess("Stream is started!");
      push(`/streams/crossbell/${streamRoomId}`);
    }
  }, [isTransactionSuccess]);

  return (
    <>
      <Typography color="text.secondary" textAlign="center" mt={1}>
        to participate in the challenge
      </Typography>
      <Formik
        initialValues={formValues}
        validationSchema={formValidationSchema}
        onSubmit={uploadData}
      >
        {({ values, errors, touched, handleChange }) => (
          <Form
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <FormikHelper onChange={(values: any) => setFormValues(values)} />
            {/* Description input */}
            <WidgetBox bgcolor={palette.blue} mt={2}>
              <WidgetTitle>Description</WidgetTitle>
              <WidgetInputTextField
                id="description"
                name="description"
                value={values.description}
                onChange={handleChange}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
                disabled={isFormDisabled}
                multiline
                maxRows={4}
                sx={{ width: 1 }}
              />
            </WidgetBox>
            {/* Submit button */}
            <ExtraLargeLoadingButton
              loading={isFormLoading}
              variant="outlined"
              type="submit"
              disabled={isFormSubmitButtonDisabled}
              sx={{ mt: 2 }}
            >
              Submit
            </ExtraLargeLoadingButton>
          </Form>
        )}
      </Formik>
    </>
  );
}
