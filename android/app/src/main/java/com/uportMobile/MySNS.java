/*
 * Copyright (C) 2018 ConsenSys AG
 *
 * This file is part of uPort Mobile App.
 *
 * uPort Mobile App is free software: you can redistribute it and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * uPort Mobile App is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with uPort Mobile App.
 * If not, see <http://www.gnu.org/licenses/>.
 *
 */
package com.uportMobile;


import android.content.Context;
import android.content.SharedPreferences;

import com.amazonaws.AmazonClientException;
import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.cognito.CognitoSyncManager;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.model.CreatePlatformEndpointRequest;
import com.amazonaws.services.sns.model.CreatePlatformEndpointResult;
import com.amazonaws.services.sns.model.GetEndpointAttributesRequest;
import com.amazonaws.services.sns.model.GetEndpointAttributesResult;
import com.amazonaws.services.sns.model.InvalidParameterException;
import com.amazonaws.services.sns.model.NotFoundException;
import com.amazonaws.services.sns.model.SetEndpointAttributesRequest;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.uport.sdk.signer.storage.ProtectedSharedPreferences;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by Aldi Gjoka.
 */
public class MySNS extends ReactContextBaseJavaModule {
    private final SharedPreferences prefs;
    private AmazonSNSClient myClient;
    //String endpointArn;
    private static final String KEY_ENDPOINT = "endpoint";
    private static final String PREFERENCE_NAME = "MyPref";

    @SuppressWarnings("WeakerAccess")
    public MySNS(ReactApplicationContext reactContext) {
        super(reactContext);
        prefs = new ProtectedSharedPreferences(reactContext, reactContext.getSharedPreferences(PREFERENCE_NAME, Context.MODE_PRIVATE));
    }

    @Override
    public String getName() {
        return "MySNS";
    }

    //Parameters: Context = main application context,
    @ReactMethod
    public void registerDevice(String firebaseToken, String address, Promise promise) {
        try {


            String endpointArn = retrieveEndpointArn();

            CognitoCachingCredentialsProvider credentialsProvider = new CognitoCachingCredentialsProvider(
                    this.getReactApplicationContext(),
                    "us-west-2:0be7c308-3ff5-4e24-adab-604327d4c9d4", // Identity Pool ID
                    Regions.US_WEST_2 // Region
            );

            CognitoSyncManager syncClient = new CognitoSyncManager(
                    this.getReactApplicationContext(),
                    Regions.US_WEST_2, // Region
                    credentialsProvider);

            myClient = new AmazonSNSClient(credentialsProvider);
            myClient.setRegion(Region.getRegion(Regions.US_WEST_2));
            boolean createNeeded = (null == endpointArn);
            boolean updateNeeded = false;

            if (createNeeded) {
                // No platform endpoint ARN is stored; need to call createEndpoint.
                endpointArn = createEndpoint(firebaseToken, address);
                createNeeded = false;
            }

            System.out.println("Retrieving platform endpoint data...");
            // Look up the platform endpoint and make sure the data in it is current, even if
            // it was just created.
            try {
                GetEndpointAttributesRequest geaReq =
                        new GetEndpointAttributesRequest()
                                .withEndpointArn(endpointArn);
                GetEndpointAttributesResult geaRes =
                        myClient.getEndpointAttributes(geaReq);

                updateNeeded = !geaRes.getAttributes().get("Token").equals(firebaseToken)
                        || !geaRes.getAttributes().get("Enabled").equalsIgnoreCase("true");

            } catch (NotFoundException nfe) {
                // We had a stored ARN, but the platform endpoint associated with it
                // disappeared. Recreate it.
                createNeeded = true;
            } catch (AmazonClientException ace) {
                promise.reject("AMAZON CLIENT EXCEPTION", ace);
            }

            System.out.println("updateNeeded = " + updateNeeded);

            if (updateNeeded) {
                // The platform endpoint is out of sync with the current data;
                // update the token and enable it.
                System.out.println("Updating platform endpoint " + endpointArn);
                Map<String, String> attribs = new HashMap<>();
                attribs.put("Token", firebaseToken);
                attribs.put("Enabled", "true");
                SetEndpointAttributesRequest saeReq =
                        new SetEndpointAttributesRequest()
                                .withEndpointArn(endpointArn)
                                .withAttributes(attribs);
                myClient.setEndpointAttributes(saeReq);
            }

            //return endpointArn;
            promise.resolve(endpointArn);
        } catch (IllegalViewOperationException e) {
            promise.reject("LAYOUT ERROR", e);
        }
        //return endpointArn;
    }

    @ReactMethod
    public String createEndpoint(String token, String address) {

        String endpointArn;
        try {
            System.out.println("Creating platform endpoint with token " + token);
            CreatePlatformEndpointRequest cpeReq = new CreatePlatformEndpointRequest()
                    .withCustomUserData(address)
                    .withPlatformApplicationArn("arn:aws:sns:us-west-2:113196216558:app/GCM/uPort")
                    .withToken(token);

            //Result of platform endpoint creation
            CreatePlatformEndpointResult cpeRes = myClient.createPlatformEndpoint(cpeReq);

            //endpointArn is the unique id for that endpoint
            endpointArn = cpeRes.getEndpointArn();

        } catch (InvalidParameterException ipe) {
            String message = ipe.getErrorMessage();
            System.out.println("Exception message: " + message);
            Pattern p = Pattern
                    .compile(".*Endpoint (arn:aws:sns[^ ]+) already exists " +
                            "with the same Token.*");
            Matcher m = p.matcher(message);
            if (m.matches()) {
                // The platform endpoint already exists for this token, but with
                // additional custom data that
                // createEndpoint doesn't want to overwrite. Just use the
                // existing platform endpoint.
                endpointArn = m.group(1);
            } else {
                // Rethrow the exception, the input is actually bad.
                throw ipe;
            }
        }
        storeEndpointArn(endpointArn);
        return endpointArn;
    }


    /**
     * @return the ARN the app was registered under previously, or null if no
     * platform endpoint ARN is stored.
     */
    private String retrieveEndpointArn() {
        // Retrieve the platform endpoint ARN from permanent storage,
        // or return null if null is stored.
        return prefs.getString(KEY_ENDPOINT, null);
    }

    /**
     * Stores the platform endpoint ARN in permanent storage for lookup next time.
     */
    private void storeEndpointArn(String endpointArn) {
        // Write the platform endpoint ARN to permanent storage.
        prefs.edit()
                .putString(KEY_ENDPOINT, endpointArn)
                .apply();
    }
}
