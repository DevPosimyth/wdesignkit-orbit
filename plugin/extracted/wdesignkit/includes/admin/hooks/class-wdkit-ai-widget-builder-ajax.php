<?php
/**
 * AI Widget Builder — WordPress proxies all traffic to the live Next.js API
 * (WDKIT_WIDGET_BUILDER_PROXY_BASE / {type}). No direct AI bridge calls from PHP.
 *
 * @package Wdesignkit
 * @since   1.2.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'Wdkit_Ai_Widget_Builder_Ajax' ) ) {

	/**
	 * Proxies widget builder requests to the Next.js layer.
	 */
	class Wdkit_Ai_Widget_Builder_Ajax {

		/**
		 * Singleton instance.
		 *
		 * @var self|null
		 */
		private static $instance;

		/**
		 * Initiator.
		 */
		public static function get_instance() {
			if ( ! isset( self::$instance ) ) {
				self::$instance = new self();
			}
			return self::$instance;
		}

		/**
		 * Constructor — register AJAX and legacy filter.
		 */
		public function __construct() {
			add_filter( 'wp_Wdkit_Ai_Widget_Builder_Ajax', array( $this, 'wp_Wdkit_Ai_Widget_Builder_Ajax_call' ) );
			add_action( 'wp_ajax_wkit_ai_widget_builder', array( $this, 'wkit_ai_widget_builder' ) );
		}

		/**
		 * Next.js widget builder base URL.
		 */
		private function get_widget_builder_proxy_base() {
			if ( defined( 'WDKIT_WIDGET_BUILDER_PROXY_BASE' ) ) {
				return untrailingslashit( (string) WDKIT_WIDGET_BUILDER_PROXY_BASE );
			}
			return untrailingslashit( WDKIT_SERVER_SITE_URL ) . '/next/api/v2/ai/widget_builder';
		}

		/**
		 * SSE stream URL on the Next proxy (browser must not use the raw bridge host).
		 *
		 * @param string $job_id Job id.
		 * @param string $token  Optional stream token.
		 * @return string
		 */
		private function widget_builder_stream_url( $job_id, $token = '' ) {
			$base = $this->get_widget_builder_proxy_base();
			$url  = $base . '/stream/' . rawurlencode( $job_id );
			if ( $token !== '' ) {
				$url .= '?token=' . rawurlencode( $token );
			}
			return $url;
		}

		/**
		 * POST JSON to Next.js /widget_builder/{type}.
		 *
		 * @param string $type    Endpoint name (e.g. send_message).
		 * @param array  $payload Request body.
		 * @return array{ok:bool,data?:mixed,message?:string}
		 */
		private function request_next_proxy( $type, $payload = array() ) {
			$url = $this->get_widget_builder_proxy_base() . '/' . rawurlencode( $type );

			$response = wp_remote_post(
				$url,
				array(
					'timeout' => 120,
					'headers' => array( 'Content-Type' => 'application/json' ),
					'body'    => wp_json_encode( $payload ),
				)
			);

			if ( is_wp_error( $response ) ) {
				return array(
					'ok'      => false,
					'message' => $response->get_error_message(),
				);
			}

			$code = wp_remote_retrieve_response_code( $response );
			$body = wp_remote_retrieve_body( $response );
			$data = json_decode( $body, true );

			if ( ! is_array( $data ) ) {
				return array(
					'ok'      => false,
					'message' => __( 'Invalid response from widget builder API', 'wdesignkit' ),
				);
			}

			if ( ! empty( $data['success'] ) ) {
				return array(
					'ok'   => true,
					'data' => isset( $data['data'] ) ? $data['data'] : null,
				);
			}

			$msg = isset( $data['message'] ) ? $data['message'] : ( isset( $data['error'] ) ? $data['error'] : __( 'Request failed', 'wdesignkit' ) );
			if ( $code >= 400 && is_string( $body ) && '' !== trim( $body ) && ( ! is_string( $msg ) || '' === $msg ) ) {
				$msg = __( 'Request failed', 'wdesignkit' );
			}

			return array(
				'ok'      => false,
				'message' => is_string( $msg ) ? $msg : __( 'Request failed', 'wdesignkit' ),
			);
		}

		/**
		 * Forward multipart upload to Next upload_design_image.
		 */
		private function proxy_upload_design_image_to_next() {
			if ( empty( $_FILES['file'] ) || empty( $_FILES['file']['tmp_name'] ) ) {
				wp_send_json_error( array( 'message' => __( 'No file uploaded', 'wdesignkit' ) ) );
			}

			$file      = $_FILES['file'];
			$mime_type = isset( $file['type'] ) ? $file['type'] : '';
			$allowed   = array( 'image/jpeg', 'image/png', 'image/webp' );

			if ( ! in_array( $mime_type, $allowed, true ) ) {
				wp_send_json_error( array( 'message' => __( 'Invalid file type. Please upload a JPEG, PNG, or WebP image.', 'wdesignkit' ) ) );
			}

			$max_size = 10 * 1024 * 1024;
			if ( isset( $file['size'] ) && $file['size'] > $max_size ) {
				wp_send_json_error( array( 'message' => __( 'File is too large. Maximum size is 10MB.', 'wdesignkit' ) ) );
			}

			$file_content = file_get_contents( $file['tmp_name'] );
			if ( false === $file_content ) {
				wp_send_json_error( array( 'message' => __( 'Failed to read uploaded file', 'wdesignkit' ) ) );
			}

			$boundary = wp_generate_password( 24, false );
			$body     = '';
			$body    .= '--' . $boundary . "\r\n";
			$body    .= 'Content-Disposition: form-data; name="file"; filename="' . basename( $file['name'] ) . '"' . "\r\n";
			$body    .= 'Content-Type: ' . $mime_type . "\r\n\r\n";
			$body    .= $file_content . "\r\n";
			$body    .= '--' . $boundary . '--' . "\r\n";

			$url      = $this->get_widget_builder_proxy_base() . '/upload_design_image';
			$response = wp_remote_post(
				$url,
				array(
					'headers' => array(
						'Content-Type' => 'multipart/form-data; boundary=' . $boundary,
					),
					'body'    => $body,
					'timeout' => 120,
				)
			);

			if ( is_wp_error( $response ) ) {
				wp_send_json_error( array( 'message' => __( 'Failed to upload image: ', 'wdesignkit' ) . $response->get_error_message() ) );
			}

			$status_code   = wp_remote_retrieve_response_code( $response );
			$response_body = wp_remote_retrieve_body( $response );
			$decoded       = json_decode( $response_body, true );

			if ( $status_code === 413 ) {
				wp_send_json_error( array( 'message' => __( 'File is too large for the server', 'wdesignkit' ) ) );
			}

			if ( ! is_array( $decoded ) || empty( $decoded['success'] ) ) {
				$message = __( 'Image upload failed', 'wdesignkit' );
				if ( is_array( $decoded ) && ! empty( $decoded['message'] ) ) {
					$message = $decoded['message'];
				}
				wp_send_json_error( array( 'message' => $message, 'status_code' => $status_code ) );
			}

			$bridge_data = isset( $decoded['data'] ) ? $decoded['data'] : null;
			if ( ! is_array( $bridge_data ) || empty( $bridge_data['uploadId'] ) ) {
				wp_send_json_error( array( 'message' => __( 'Invalid response — missing uploadId', 'wdesignkit' ) ) );
			}

			wp_send_json_success(
				array(
					'uploadId' => $bridge_data['uploadId'],
					'status'   => isset( $bridge_data['status'] ) ? $bridge_data['status'] : 'analyzing',
					'message'  => __( 'Image uploaded successfully', 'wdesignkit' ),
				)
			);
		}

		/**
		 * Single AJAX entry: action wkit_ai_widget_builder, wb_type, payload JSON.
		 */
		public function wkit_ai_widget_builder() {
			check_ajax_referer( 'wdkit_nonce', 'kit_nonce' );

			if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( array( 'message' => __( 'Insufficient permissions.', 'wdesignkit' ) ) );
			}

			$type = isset( $_POST['wb_type'] ) ? sanitize_text_field( wp_unslash( $_POST['wb_type'] ) ) : '';
			if ( '' === $type ) {
				wp_send_json_error( array( 'message' => __( 'Missing API type.', 'wdesignkit' ) ) );
			}

			if ( 'upload_design_image' === $type ) {
				$this->proxy_upload_design_image_to_next();
				return;
			}

			$payload = array();
			if ( isset( $_POST['payload'] ) && '' !== $_POST['payload'] ) {
				$decoded = json_decode( wp_unslash( $_POST['payload'] ), true );
				if ( ! is_array( $decoded ) ) {
					wp_send_json_error( array( 'message' => __( 'Invalid JSON payload.', 'wdesignkit' ) ) );
				}
				$payload = $decoded;
			}

			if ( 'check_job_status' === $type ) {
				$job_id = '';
				if ( ! empty( $payload['jobId'] ) ) {
					$job_id = sanitize_text_field( $payload['jobId'] );
				} elseif ( ! empty( $payload['job_id'] ) ) {
					$job_id = sanitize_text_field( $payload['job_id'] );
				}
				if ( '' === $job_id ) {
					wp_send_json_error( array( 'message' => __( 'Job ID is required', 'wdesignkit' ) ) );
				}
				$this->wb_run_check_job_status( $job_id );
				return;
			}

			$result = $this->request_next_proxy( $type, $payload );
			if ( ! $result['ok'] ) {
				wp_send_json_error( array( 'message' => $result['message'] ) );
			}

			wp_send_json_success( $result['data'] );
		}

		/**
		 * Legacy filter from get_wdesignkit.
		 *
		 * @param string $type Action type.
		 */
		public function wp_Wdkit_Ai_Widget_Builder_Ajax_call( $type ) {
			check_ajax_referer( 'wdkit_nonce', 'kit_nonce' );

			if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( array( 'content' => __( 'Insufficient permissions.', 'wdesignkit' ) ) );
			}

			switch ( $type ) {
				case 'wkit_check_job_status':
					$job_id = isset( $_POST['job_id'] ) ? sanitize_text_field( wp_unslash( $_POST['job_id'] ) ) : '';
					if ( '' === $job_id ) {
						wp_send_json_error( array( 'message' => __( 'Job ID is required', 'wdesignkit' ) ) );
					}
					$this->wb_run_check_job_status( $job_id );
					return;
				case 'wkit_upload_design_image':
					$this->proxy_upload_design_image_to_next();
					return;
				case 'wkit_check_upload_status':
					$this->wkit_check_upload_status();
					return;
				case 'wkit_hitl_resume':
					$this->wkit_hitl_resume();
					return;
				case 'wkit_hitl_cancel':
					$this->wkit_hitl_cancel();
					return;
				case 'wkit_resume_checkpoint':
					$this->wkit_resume_checkpoint();
					return;
				default:
					wp_send_json_error( array( 'message' => __( 'Unknown action type: ', 'wdesignkit' ) . $type ) );
			}
		}

		/**
		 * Poll upload analysis status.
		 */
		public function wkit_check_upload_status() {
			$upload_id = isset( $_POST['upload_id'] ) ? sanitize_text_field( wp_unslash( $_POST['upload_id'] ) ) : '';
			if ( '' === $upload_id ) {
				wp_send_json_error( array( 'message' => __( 'Upload ID is required', 'wdesignkit' ) ) );
			}

			$result = $this->request_next_proxy(
				'check_upload_status',
				array( 'uploadId' => $upload_id )
			);

			if ( ! $result['ok'] ) {
				wp_send_json_error( array( 'message' => $result['message'] ) );
			}

			$d = $result['data'];
			if ( ! is_array( $d ) ) {
				wp_send_json_error( array( 'message' => __( 'Invalid response', 'wdesignkit' ) ) );
			}

			wp_send_json_success(
				array(
					'uploadId'        => isset( $d['uploadId'] ) ? $d['uploadId'] : $upload_id,
					'status'          => isset( $d['status'] ) ? $d['status'] : 'unknown',
					'analyzed'        => isset( $d['analyzed'] ) ? $d['analyzed'] : false,
					'analysisPreview' => isset( $d['analysisPreview'] ) ? $d['analysisPreview'] : null,
					'error'           => isset( $d['error'] ) ? $d['error'] : null,
				)
			);
		}

		/**
		 * HITL resume — proxy then return stream URL on Next host.
		 */
		public function wkit_hitl_resume() {
			$job_id     = isset( $_POST['job_id'] ) ? sanitize_text_field( wp_unslash( $_POST['job_id'] ) ) : '';
			$thread_id  = isset( $_POST['thread_id'] ) ? sanitize_text_field( wp_unslash( $_POST['thread_id'] ) ) : '';
			$answers_raw = isset( $_POST['answers'] ) ? wp_unslash( $_POST['answers'] ) : '{}';
			$answers     = json_decode( $answers_raw, true );

			if ( '' === $job_id || '' === $thread_id ) {
				wp_send_json_error( array( 'message' => __( 'Job ID and Thread ID are required', 'wdesignkit' ) ) );
			}

			$result = $this->request_next_proxy(
				'hitl_resume',
				array(
					'jobId'    => $job_id,
					'threadId' => $thread_id,
					'answers'  => is_array( $answers ) ? $answers : array(),
				)
			);

			if ( ! $result['ok'] ) {
				wp_send_json_error( array( 'message' => $result['message'] ) );
			}

			$bridge_data   = $result['data'];
			$stream_token  = is_array( $bridge_data ) && isset( $bridge_data['streamToken'] ) ? $bridge_data['streamToken'] : '';
			$stream_url    = $this->widget_builder_stream_url( $job_id, $stream_token );

			wp_send_json_success(
				array(
					'job_id'       => $job_id,
					'thread_id'    => $thread_id,
					'status'       => 'RESUMING',
					'stream_url'   => $stream_url,
					'stream_token' => $stream_token,
				)
			);
		}

		/**
		 * HITL cancel.
		 */
		public function wkit_hitl_cancel() {
			$job_id    = isset( $_POST['job_id'] ) ? sanitize_text_field( wp_unslash( $_POST['job_id'] ) ) : '';
			$thread_id = isset( $_POST['thread_id'] ) ? sanitize_text_field( wp_unslash( $_POST['thread_id'] ) ) : '';
			$reason    = isset( $_POST['reason'] ) ? sanitize_text_field( wp_unslash( $_POST['reason'] ) ) : 'User cancelled HITL flow';

			if ( '' === $job_id || '' === $thread_id ) {
				wp_send_json_error( array( 'message' => __( 'Job ID and Thread ID are required', 'wdesignkit' ) ) );
			}

			$result = $this->request_next_proxy(
				'hitl_cancel',
				array(
					'jobId'    => $job_id,
					'threadId' => $thread_id,
					'reason'   => $reason,
				)
			);

			if ( ! $result['ok'] ) {
				wp_send_json_error( array( 'message' => $result['message'] ) );
			}

			wp_send_json_success(
				array(
					'job_id'    => $job_id,
					'thread_id' => $thread_id,
					'status'    => 'CANCELLED',
					'message'   => __( 'Widget generation cancelled.', 'wdesignkit' ),
				)
			);
		}

		/**
		 * Resume from checkpoint.
		 */
		public function wkit_resume_checkpoint() {
			$job_id    = isset( $_POST['job_id'] ) ? sanitize_text_field( wp_unslash( $_POST['job_id'] ) ) : '';
			$thread_id = isset( $_POST['thread_id'] ) ? sanitize_text_field( wp_unslash( $_POST['thread_id'] ) ) : '';

			if ( '' === $job_id ) {
				wp_send_json_error( array( 'message' => __( 'Job ID is required', 'wdesignkit' ) ) );
			}

			$payload = array( 'jobId' => $job_id );
			if ( '' !== $thread_id ) {
				$payload['threadId'] = $thread_id;
			}
			if ( isset( $_POST['primaryModel'] ) ) {
				$payload['primaryModel'] = sanitize_text_field( wp_unslash( $_POST['primaryModel'] ) );
			}
			if ( isset( $_POST['primaryProvider'] ) ) {
				$payload['primaryProvider'] = sanitize_text_field( wp_unslash( $_POST['primaryProvider'] ) );
			}

			$result = $this->request_next_proxy( 'resume_checkpoint', $payload );

			if ( ! $result['ok'] ) {
				wp_send_json_error( array( 'message' => $result['message'] ) );
			}

			$bridge_data  = $result['data'];
			$stream_token = is_array( $bridge_data ) && isset( $bridge_data['streamToken'] ) ? $bridge_data['streamToken'] : '';
			$stream_url   = $this->widget_builder_stream_url( $job_id, $stream_token );

			wp_send_json_success(
				array(
					'job_id'       => $job_id,
					'thread_id'    => is_array( $bridge_data ) && isset( $bridge_data['threadId'] ) ? $bridge_data['threadId'] : $thread_id,
					'status'       => 'RESUMING',
					'nextNode'     => is_array( $bridge_data ) && isset( $bridge_data['nextNode'] ) ? $bridge_data['nextNode'] : 'unknown',
					'stream_url'   => $stream_url,
					'stream_token' => $stream_token,
				)
			);
		}

		/**
		 * Job status + artifact formatting for the widget builder UI.
		 *
		 * @param string $job_id Job id.
		 */
		private function wb_run_check_job_status( $job_id ) {
			$fetch = $this->request_next_proxy( 'check_job_status', array( 'jobId' => $job_id ) );

			if ( ! $fetch['ok'] ) {
				wp_send_json_error( array( 'message' => $fetch['message'] ) );
			}

			$job_data = $fetch['data'];
			if ( ! is_array( $job_data ) ) {
				wp_send_json_error( array( 'message' => __( 'Invalid job status response', 'wdesignkit' ) ) );
			}

			if ( ! isset( $job_data['status'] ) || ! isset( $job_data['jobId'] ) ) {
				wp_send_json_error(
					array(
						'message' => __( 'Invalid job status format — missing required fields', 'wdesignkit' ),
					)
				);
			}

			$status   = $job_data['status'];
			$progress = isset( $job_data['data'] ) && is_array( $job_data['data'] ) ? $job_data['data'] : array( 'stage' => $status );
			if ( empty( $progress['stage'] ) ) {
				$progress['stage'] = $status;
			}

			$job_metrics = array(
				'tokensUsed'      => isset( $job_data['tokensUsed'] ) ? (int) $job_data['tokensUsed'] : null,
				'creditsDeducted' => isset( $job_data['creditsDeducted'] ) ? (int) $job_data['creditsDeducted'] : null,
				'costUsd'         => isset( $job_data['costUsd'] ) ? (float) $job_data['costUsd'] : null,
				'ai_model'        => $this->normalize_job_model( isset( $job_data['model'] ) ? $job_data['model'] : null ),
				'request_type'    => isset( $job_data['mode'] ) ? sanitize_text_field( wp_unslash( $job_data['mode'] ) ) : null,
			);

			if ( 'ARTIFACT_READY' === $status || 'COMPLETED' === $status ) {
				$embedded_result = null;
				if ( isset( $progress['result'] ) && is_array( $progress['result'] ) ) {
					$embedded_result = $progress['result'];
					unset( $progress['result'] );
				}

				if ( $embedded_result ) {
					$formatted_response = $this->format_artifact_for_plugin( $embedded_result, $job_data );
					wp_send_json_success(
						array(
							'data' => array_merge(
								array(
									'status'   => $status,
									'progress' => $progress,
									'result'   => $formatted_response,
								),
								$job_metrics
							),
						)
					);
					return;
				}

				$artifact_fetch = $this->request_next_proxy( 'get_artifact', array( 'jobId' => $job_id ) );
				if ( ! $artifact_fetch['ok'] ) {
					wp_send_json_error( array( 'message' => __( 'Failed to retrieve widget artifact', 'wdesignkit' ) ) );
				}

				$artifact = $artifact_fetch['data'];
				if ( ! is_array( $artifact ) ) {
					wp_send_json_error( array( 'message' => __( 'Invalid artifact response', 'wdesignkit' ) ) );
				}

				$formatted_response = $this->format_artifact_for_plugin( $artifact, $job_data );

				wp_send_json_success(
					array(
						'data' => array_merge(
							array(
								'status'   => $status,
								'progress' => $progress,
								'result'   => $formatted_response,
							),
							$job_metrics
						),
					)
				);
			} elseif ( 'FAILED' === $status ) {
				wp_send_json_success(
					array(
						'data' => array_merge(
							array(
								'status'   => 'FAILED',
								'progress' => $progress,
								'error'    => isset( $progress['error'] ) ? $progress['error'] : __( 'Widget generation failed', 'wdesignkit' ),
							),
							$job_metrics
						),
					)
				);
			} else {
				wp_send_json_success(
					array(
						'data' => array_merge(
							array(
								'status'   => $status,
								'progress' => $progress,
							),
							$job_metrics
						),
					)
				);
			}
		}

		/**
		 * Normalize job model field.
		 *
		 * @param mixed $model Model from job.
		 * @return string|null
		 */
		private function normalize_job_model( $model ) {
			if ( is_array( $model ) && ! empty( $model ) ) {
				$sanitized = array();
				foreach ( $model as $m ) {
					if ( is_string( $m ) && '' !== $m ) {
						$sanitized[] = sanitize_text_field( $m );
					}
				}
				return ! empty( $sanitized ) ? implode( ', ', $sanitized ) : null;
			}
			if ( is_string( $model ) && '' !== $model ) {
				return sanitize_text_field( $model );
			}
			return null;
		}

		/**
		 * Format artifact for plugin consumption.
		 *
		 * @param array $artifact  Artifact payload.
		 * @param array $job_data  Job metadata.
		 * @return array
		 */
		private function format_artifact_for_plugin( $artifact, $job_data ) {
			if ( is_array( $artifact ) && isset( $artifact['controllers'] ) && is_array( $artifact['controllers'] ) ) {
				$response = $artifact;

				if ( ! isset( $response['controllers']['content'] ) && isset( $artifact['content'] ) && is_array( $artifact['content'] ) ) {
					$response['controllers']['content'] = $artifact['content'];
				}

				if ( ! isset( $response['controllers']['style'] ) && isset( $artifact['style'] ) && is_array( $artifact['style'] ) ) {
					$response['controllers']['style'] = $artifact['style'];
				}

				if ( ! isset( $response['libraries'] ) && isset( $artifact['libraries'] ) ) {
					$response['libraries'] = $artifact['libraries'];
				}

				if ( ! isset( $response['tokens_used'] ) ) {
					$response['tokens_used'] = isset( $job_data['tokensUsed'] ) ? (int) $job_data['tokensUsed'] : 0;
				}

				if ( ! isset( $response['ai_model'] ) ) {
					$response['ai_model'] = $this->normalize_job_model( isset( $job_data['model'] ) ? $job_data['model'] : null );
				}

				if ( ! isset( $response['request_type'] ) ) {
					$response['request_type'] = isset( $job_data['mode'] ) ? sanitize_text_field( wp_unslash( $job_data['mode'] ) ) : null;
				}

				if ( ! isset( $response['is_modification'] ) ) {
					$response['is_modification'] = ( isset( $job_data['mode'] ) && 'modify' === $job_data['mode'] );
				}

				return $response;
			}

			$html              = isset( $artifact['html'] ) ? $artifact['html'] : '';
			$css               = isset( $artifact['css'] ) ? $artifact['css'] : '';
			$js                = isset( $artifact['js'] ) ? $artifact['js'] : '';
			$detected_libs     = isset( $artifact['libraries'] ) ? $artifact['libraries'] : array();
			$ai_content_sections = isset( $artifact['content'] ) ? $artifact['content'] : array();
			$ai_style_sections   = isset( $artifact['style'] ) ? $artifact['style'] : array();

			$ai_libraries = $this->process_ai_libraries( $detected_libs );

			$formatted_controllers = array(
				'content' => $ai_content_sections ? $ai_content_sections : array(
					array(
						'section'  => 'Content',
						'controls' => array(),
					),
				),
				'style'   => $ai_style_sections ? $ai_style_sections : array(
					array(
						'section'  => 'Style',
						'controls' => array(),
					),
				),
			);

			return array(
				'controllers'     => $formatted_controllers,
				'html'            => $html,
				'css'             => $css,
				'js'              => $js,
				'libraries'       => $ai_libraries,
				'tokens_used'     => isset( $job_data['tokensUsed'] ) ? $job_data['tokensUsed'] : 0,
				'ai_model'        => $this->normalize_job_model( isset( $job_data['model'] ) ? $job_data['model'] : null ),
				'is_modification' => isset( $job_data['mode'] ) && 'modify' === $job_data['mode'],
			);
		}

		/**
		 * Process AI library list.
		 *
		 * @param mixed $ai_libraries Raw libraries.
		 * @return array
		 */
		private function process_ai_libraries( $ai_libraries ) {
			$processed = array();

			if ( ! is_array( $ai_libraries ) ) {
				return $processed;
			}

			foreach ( $ai_libraries as $lib ) {
				if ( is_string( $lib ) ) {
					$lib_key            = strtolower( str_replace( array( '.', ' ' ), '', $lib ) );
					$processed[ $lib_key ] = array(
						'name'   => $lib,
						'cdn'    => '',
						'reason' => 'Library requested: ' . $lib,
					);
				} elseif ( is_array( $lib ) && isset( $lib['name'] ) ) {
					$lib_key = strtolower( str_replace( array( '.', ' ', '-' ), '', $lib['name'] ) );

					if ( isset( $lib['cdn'] ) && ! empty( $lib['cdn'] ) ) {
						$processed[ $lib_key ] = array(
							'name'   => $lib['name'],
							'cdn'    => $lib['cdn'],
							'reason' => isset( $lib['reason'] ) ? $lib['reason'] : __( 'Required for widget functionality', 'wdesignkit' ),
						);
					}
				}
			}

			return $processed;
		}
	}

	Wdkit_Ai_Widget_Builder_Ajax::get_instance();
}
